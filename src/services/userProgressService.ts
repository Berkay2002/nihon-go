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
        // Return mock data for guest users with artificial delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return await guestProgressService.getUserProgress();
      } catch (error) {
        console.error('Error in guest getUserProgressData:', error);
        return [];
      }
    }
    
    if (!user) return null;
    
    try {
      const result = await userProgressApi.getUserProgress(user.id);
      return result;
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
        // Return mock streak data for guest users with artificial delay
        await new Promise(resolve => setTimeout(resolve, 300));
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
      const streak = await userProgressApi.getUserStreak(user.id);
      
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