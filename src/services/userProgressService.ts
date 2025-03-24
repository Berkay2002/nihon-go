
import { useAuth } from "@/hooks/useAuth";
import { 
  UserProgress, 
  ExerciseResult, 
  UserStreak,
  userProgressApi, 
  guestProgressService 
} from "./userProgress";

// Hook for accessing progress in components
export const useUserProgress = () => {
  const { user, isLoading, isGuest } = useAuth();
  
  const getUserProgressData = async () => {
    if (isLoading) return null;
    
    if (isGuest) {
      try {
        // Return mock data for guest users with no artificial delay
        return await guestProgressService.getUserProgress();
      } catch (error) {
        console.error('Error in guest getUserProgressData:', error);
        return [];
      }
    }
    
    if (!user) return null;
    
    try {
      // Add a timeout to the API call
      const progressPromise = userProgressApi.getUserProgress(user.id);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Progress data fetch timeout')), 5000)
      );
      
      // Race the real API call against the timeout
      const result = await Promise.race([progressPromise, timeoutPromise]) as UserProgress[] | null;
      return result || [];
    } catch (error) {
      console.error('Error in getUserProgressData:', error);
      // Return empty array instead of null to avoid undefined errors
      return [];
    }
  };
  
  const getUserStreakData = async () => {
    if (isLoading) return null;
    
    if (isGuest) {
      try {
        // Return mock streak data for guest users with no artificial delay
        return await guestProgressService.getUserStreak();
      } catch (error) {
        console.error('Error in guest getUserStreakData:', error);
        // Return fallback streak data
        return {
          id: 'guest-streak',
          user_id: 'guest',
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString(),
          daily_goal: 50,
          daily_xp: 15,
          total_xp: 15,
          level: 1
        };
      }
    }
    
    if (!user) return null;
    
    try {
      // Add a timeout to the API call
      const streakPromise = userProgressApi.getUserStreak(user.id);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Streak data fetch timeout')), 5000)
      );
      
      // Race the real API call against the timeout
      const streak = await Promise.race([streakPromise, timeoutPromise]) as UserStreak | null;
      
      // If no streak record exists yet, return a default one to avoid null errors
      if (!streak) {
        console.log('No streak record found, returning default');
        return {
          id: 'default-streak',
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: new Date().toISOString(),
          daily_goal: 50,
          daily_xp: 0,
          total_xp: 0,
          level: 1
        };
      }
      
      return streak;
    } catch (error) {
      console.error('Error in getUserStreakData:', error);
      // Return fallback streak data
      return {
        id: 'fallback-streak',
        user_id: user.id,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: new Date().toISOString(),
        daily_goal: 50,
        daily_xp: 0,
        total_xp: 0,
        level: 1
      };
    }
  };
  
  // Choose between real or mock services based on guest mode
  const service = isGuest ? guestProgressService : userProgressApi;
  
  // Safe update functions with error handling
  const safeUpdateLessonProgress = async (
    lessonId: string, 
    isCompleted: boolean, 
    accuracy: number, 
    xpEarned: number
  ) => {
    try {
      if (user && !isGuest) {
        await service.updateLessonProgress(user.id, lessonId, isCompleted, accuracy, xpEarned);
      } else if (isGuest) {
        await service.updateLessonProgress('guest', lessonId, isCompleted, accuracy, xpEarned);
      }
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      // Don't rethrow - fail silently to avoid breaking the UI
    }
  };
  
  const safeSubmitExerciseResult = async (result: ExerciseResult) => {
    try {
      if (user && !isGuest) {
        await service.submitExerciseResult(user.id, result);
      } else if (isGuest) {
        await service.submitExerciseResult('guest', result);
      }
    } catch (error) {
      console.error('Error submitting exercise result:', error);
      // Don't rethrow - fail silently to avoid breaking the UI
    }
  };
  
  const safeUpdateUserStreak = async (dailyXpToAdd: number, extendStreak: boolean = true) => {
    try {
      if (user && !isGuest) {
        return await service.updateUserStreak(user.id, dailyXpToAdd, extendStreak);
      } else if (isGuest) {
        return await service.updateUserStreak('guest', dailyXpToAdd, extendStreak);
      }
      return null;
    } catch (error) {
      console.error('Error updating user streak:', error);
      return null;
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
