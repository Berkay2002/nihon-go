
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
      // Return mock data for guest users
      return await guestProgressService.getUserProgress();
    }
    
    if (!user) return null;
    
    try {
      return await userProgressApi.getUserProgress(user.id);
    } catch (error) {
      console.error('Error in useUserProgress:', error);
      return null;
    }
  };
  
  const getUserStreakData = async () => {
    if (isLoading) return null;
    
    if (isGuest) {
      // Return mock streak data for guest users
      return await guestProgressService.getUserStreak();
    }
    
    if (!user) return null;
    
    try {
      return await userProgressApi.getUserStreak(user.id);
    } catch (error) {
      console.error('Error in useUserProgress:', error);
      return null;
    }
  };
  
  // Choose between real or mock services based on guest mode
  const service = isGuest ? guestProgressService : userProgressApi;
  
  return {
    getUserProgressData,
    getUserStreakData,
    updateLessonProgress: user && !isGuest ? 
      (lessonId: string, isCompleted: boolean, accuracy: number, xpEarned: number) => 
        service.updateLessonProgress(user.id, lessonId, isCompleted, accuracy, xpEarned) : 
      () => Promise.resolve(),
    submitExerciseResult: user && !isGuest ?
      (result: ExerciseResult) => service.submitExerciseResult(user.id, result) :
      () => Promise.resolve(),
    updateUserStreak: user && !isGuest ?
      (dailyXpToAdd: number, extendStreak: boolean = true) => 
        service.updateUserStreak(user.id, dailyXpToAdd, extendStreak) :
      (dailyXpToAdd: number) => Promise.resolve(null)
  };
};

// Re-export types and service for direct usage
export type { UserProgress, ExerciseResult, UserStreak };
export default userProgressApi;
