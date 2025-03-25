import { useAuth } from "@/hooks/useAuth";
import { 
  UserProgress, 
  ExerciseResult, 
  UserStreak,
  userProgressApi 
} from "./userProgress";
import { baseService } from "@/services/api/baseService";

// Hook for accessing progress in components
export const useUserProgress = () => {
  const { user, isLoading } = useAuth();
  
  const getUserProgressData = async () => {
    if (isLoading) return [];
    
    if (!user) return [];
    
    try {
      // Add a timeout to the API call
      const progressPromise = userProgressApi.getUserProgress(user.id);
      const timeoutPromise = new Promise<UserProgress[]>((_, reject) => 
        setTimeout(() => reject(new Error('Progress data fetch timeout')), 3000)
      );
      
      // Race the real API call against the timeout
      return await Promise.race([progressPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error in getUserProgressData:', error);
      // Return empty array instead of null to avoid undefined errors
      return [];
    }
  };
  
  const getUserStreakData = async () => {
    if (isLoading) return getDefaultStreak();
    
    if (!user) return getDefaultStreak();
    
    try {
      // Add a timeout to the API call
      const streakPromise = userProgressApi.getUserStreak(user.id);
      const timeoutPromise = new Promise<UserStreak>((_, reject) => 
        setTimeout(() => reject(new Error('Streak data fetch timeout')), 3000)
      );
      
      // Race the real API call against the timeout
      const streak = await Promise.race([streakPromise, timeoutPromise]);
      
      // If no streak record exists yet, return a default one to avoid null errors
      if (!streak) {
        console.log('No streak record found, returning default');
        return getDefaultStreak(user.id);
      }
      
      return streak;
    } catch (error) {
      console.error('Error in getUserStreakData:', error);
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
  
  // Safe update functions with error handling
  const safeUpdateLessonProgress = async (
    lessonId: string, 
    isCompleted: boolean, 
    accuracy: number, 
    xpEarned: number
  ) => {
    try {
      if (user) {
        // Check if lesson is already completed before awarding XP
        const existingProgress = await userProgressApi.getLessonProgress(user.id, lessonId);
        
        if (existingProgress?.is_completed) {
          // Lesson already completed - don't award additional XP
          console.log(`Lesson ${lessonId} already completed. No additional XP awarded.`);
          // Still update accuracy if it improved, but with 0 XP
          await userProgressApi.updateLessonProgress(user.id, lessonId, true, 
            Math.max(existingProgress.accuracy, accuracy), existingProgress.xp_earned);
          return;
        }
        
        // Lesson not completed yet - award XP
        await userProgressApi.updateLessonProgress(user.id, lessonId, isCompleted, accuracy, xpEarned);
      }
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      // Don't rethrow - fail silently to avoid breaking the UI
    }
  };
  
  const safeSubmitExerciseResult = async (result: ExerciseResult) => {
    try {
      if (user) {
        await userProgressApi.submitExerciseResult(user.id, result);
      }
    } catch (error) {
      console.error('Error submitting exercise result:', error);
      // Don't rethrow - fail silently to avoid breaking the UI
    }
  };
  
  const safeUpdateUserStreak = async (dailyXpToAdd: number, extendStreak: boolean = true) => {
    try {
      if (user) {
        return await userProgressApi.updateUserStreak(user.id, dailyXpToAdd, extendStreak);
      }
      return getDefaultStreak();
    } catch (error) {
      console.error('Error updating user streak:', error);
      return getDefaultStreak();
    }
  };
  
  return {
    getUserProgressData,
    getUserStreakData,
    updateLessonProgress: safeUpdateLessonProgress,
    submitExerciseResult: safeSubmitExerciseResult,
    updateUserStreak: safeUpdateUserStreak
  };
};

// Re-export types and service for direct usage
export type { UserProgress, ExerciseResult, UserStreak };
export default userProgressApi;
