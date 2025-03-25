import { useAuth } from "@/hooks/useAuth";
import { 
  UserProgress, 
  ExerciseResult, 
  UserStreak,
  LessonScorecard,
  userProgressApi 
} from "./userProgress";
import { baseService } from "@/services/api/baseService";
import { useState, useEffect, useRef } from "react";

// Cache expiration time in milliseconds
const CACHE_EXPIRATION = 60000; // 1 minute

// Cache for progress and streak data
interface CacheData<T> {
  data: T;
  timestamp: number;
}

// Hook for accessing progress in components
export const useUserProgress = () => {
  const { user, isLoading } = useAuth();
  
  // Use refs for caches to persist across renders but not trigger re-renders
  const progressCache = useRef<Record<string, CacheData<UserProgress[]>>>({});
  const streakCache = useRef<Record<string, CacheData<UserStreak>>>({});
  const scorecardCache = useRef<Record<string, CacheData<LessonScorecard>>>({});
  
  // Check if cached data is still valid
  const isCacheValid = <T>(cache: CacheData<T> | undefined): boolean => {
    if (!cache) return false;
    const now = Date.now();
    return now - cache.timestamp < CACHE_EXPIRATION;
  };
  
  // Get lesson scorecard with exercise responses
  const getLessonScorecard = async (lessonId: string): Promise<LessonScorecard> => {
    if (isLoading) return getDefaultScorecard();
    if (!user) return getDefaultScorecard();
    
    try {
      // Generate cache key based on user and lesson
      const cacheKey = `${user.id}-${lessonId}`;
      
      // Check cache first
      const cachedData = scorecardCache.current[cacheKey];
      if (isCacheValid(cachedData)) {
        return cachedData.data;
      }
      
      // Add a timeout to the API call
      const scorecardPromise = userProgressApi.getLessonScorecard(user.id, lessonId);
      const timeoutPromise = new Promise<LessonScorecard>((_, reject) => 
        setTimeout(() => reject(new Error('Scorecard fetch timeout')), 10000) // 10 seconds timeout
      );
      
      // Race the real API call against the timeout
      const data = await Promise.race([scorecardPromise, timeoutPromise]);
      
      // Cache the result
      scorecardCache.current[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      
      return data;
    } catch (error) {
      console.error('Error in getLessonScorecard:', error);
      
      // Return cached data even if expired in case of error
      const cacheKey = `${user.id}-${lessonId}`;
      const cachedData = scorecardCache.current[cacheKey];
      if (cachedData) {
        return cachedData.data;
      }
      
      // Return default scorecard
      return getDefaultScorecard();
    }
  };
  
  // Helper function to get default scorecard
  const getDefaultScorecard = (): LessonScorecard => {
    return {
      totalExercises: 0,
      correctExercises: 0,
      accuracy: 100,
      xpEarned: 0,
      responses: []
    };
  };

  const getUserProgressData = async () => {
    if (isLoading) return [];
    if (!user) return [];
    
    try {
      // Check cache first
      const cachedData = progressCache.current[user.id];
      if (isCacheValid(cachedData)) {
        return cachedData.data;
      }
      
      // Add a longer timeout to the API call
      const progressPromise = userProgressApi.getUserProgress(user.id);
      const timeoutPromise = new Promise<UserProgress[]>((_, reject) => 
        setTimeout(() => reject(new Error('Progress data fetch timeout')), 10000) // Increased to 10 seconds
      );
      
      // Race the real API call against the timeout
      const data = await Promise.race([progressPromise, timeoutPromise]);
      
      // Cache the result
      progressCache.current[user.id] = {
        data,
        timestamp: Date.now()
      };
      
      return data;
    } catch (error) {
      console.error('Error in getUserProgressData:', error);
      
      // Return cached data even if expired in case of error
      const cachedData = progressCache.current[user.id];
      if (cachedData) {
        return cachedData.data;
      }
      
      // Return empty array instead of null to avoid undefined errors
      return [];
    }
  };
  
  const getUserStreakData = async () => {
    if (isLoading) return getDefaultStreak();
    if (!user) return getDefaultStreak();
    
    try {
      // Check cache first
      const cachedData = streakCache.current[user.id];
      if (isCacheValid(cachedData)) {
        return cachedData.data;
      }
      
      // Add a timeout to the API call
      const streakPromise = userProgressApi.getUserStreak(user.id);
      const timeoutPromise = new Promise<UserStreak>((_, reject) => 
        setTimeout(() => reject(new Error('Streak data fetch timeout')), 10000) // Increased to 10 seconds
      );
      
      // Race the real API call against the timeout
      const streak = await Promise.race([streakPromise, timeoutPromise]);
      
      // If no streak record exists yet, return a default one to avoid null errors
      if (!streak) {
        console.log('No streak record found, returning default');
        const defaultStreak = getDefaultStreak(user.id);
        
        // Cache the default streak
        streakCache.current[user.id] = {
          data: defaultStreak,
          timestamp: Date.now()
        };
        
        return defaultStreak;
      }
      
      // Cache the result
      streakCache.current[user.id] = {
        data: streak,
        timestamp: Date.now()
      };
      
      return streak;
    } catch (error) {
      console.error('Error in getUserStreakData:', error);
      
      // Return cached data even if expired in case of error
      const cachedData = streakCache.current[user.id];
      if (cachedData) {
        return cachedData.data;
      }
      
      // Return fallback streak data
      return getDefaultStreak(user?.id || 'fallback');
    }
  };
  
  // Helper function to get default streak data
  const getDefaultStreak = (userId: string = 'default'): UserStreak => {
    return {
      id: `${userId}-streak`,
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: new Date().toISOString(),
      daily_goal: 50,
      daily_xp: 15,
      total_xp: 15,
      level: 1
    };
  };
  
  // Clear caches when data is updated
  const clearCaches = (userId: string) => {
    delete progressCache.current[userId];
    delete streakCache.current[userId];
    // Clear scorecard caches that start with this user ID
    Object.keys(scorecardCache.current).forEach(key => {
      if (key.startsWith(userId)) {
        delete scorecardCache.current[key];
      }
    });
  };
  
  // Safe update functions with error handling
  const safeUpdateLessonProgress = async (
    lessonId: string, 
    isCompleted: boolean, 
    accuracy: number, 
    xpEarned: number
  ) => {
    if (!user) return;
    
    try {
      // First check cache or make a single API call to verify completion status
      let existingProgress: UserProgress | null = null;
      
      // Look for lesson in cache first to reduce API calls
      const cachedProgress = progressCache.current[user.id];
      if (isCacheValid(cachedProgress)) {
        existingProgress = cachedProgress.data.find(p => p.lesson_id === lessonId) || null;
      }
      
      // If not in cache, make API call
      if (!existingProgress) {
        existingProgress = await userProgressApi.getLessonProgress(user.id, lessonId);
      }
      
      if (existingProgress?.is_completed) {
        // Lesson already completed - don't award additional XP
        console.log(`Lesson ${lessonId} already completed. No additional XP awarded.`);
        // Still update accuracy if it improved, but with 0 XP
        await userProgressApi.updateLessonProgress(user.id, lessonId, true, 
          Math.max(existingProgress.accuracy, accuracy), existingProgress.xp_earned);
      } else {
        // Lesson not completed yet - award XP
        await userProgressApi.updateLessonProgress(user.id, lessonId, isCompleted, accuracy, xpEarned);
      }
      
      // Clear caches after update
      clearCaches(user.id);
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      // Don't rethrow - fail silently to avoid breaking the UI
    }
  };
  
  const safeSubmitExerciseResult = async (result: ExerciseResult) => {
    if (!user) return;
    
    try {
      await userProgressApi.submitExerciseResult(user.id, result);
      
      // Clear caches after update
      clearCaches(user.id);
    } catch (error) {
      console.error('Error submitting exercise result:', error);
      // Don't rethrow - fail silently to avoid breaking the UI
    }
  };
  
  const safeUpdateUserStreak = async (dailyXpToAdd: number, extendStreak: boolean = true) => {
    if (!user) return getDefaultStreak();
    
    try {
      // Only update streak if there is actual XP to add
      if (dailyXpToAdd <= 0) {
        console.log('No XP to add, skipping streak update');
        const currentStreak = await getUserStreakData();
        return currentStreak;
      }
      
      const result = await userProgressApi.updateUserStreak(user.id, dailyXpToAdd, extendStreak);
      
      // Clear caches after update
      clearCaches(user.id);
      
      return result;
    } catch (error) {
      console.error('Error updating user streak:', error);
      return getDefaultStreak(user.id);
    }
  };
  
  return {
    getUserProgressData,
    getUserStreakData,
    getLessonScorecard,
    updateLessonProgress: safeUpdateLessonProgress,
    submitExerciseResult: safeSubmitExerciseResult,
    updateUserStreak: safeUpdateUserStreak
  };
};

// Re-export types and service for direct usage
export type { UserProgress, ExerciseResult, UserStreak, LessonScorecard };
export default userProgressApi;
