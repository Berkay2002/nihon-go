
import { createContext, useContext } from 'react';
import { userProgressApi } from './userProgress/userProgressApi';
import { 
  UserProgress, 
  UserStreak, 
  ExerciseResult, 
  LessonScorecard 
} from './userProgress/types';

// Create a context for the user progress service
export const UserProgressContext = createContext<ReturnType<typeof createUserProgressService> | null>(null);

// Custom hook for accessing user progress service
export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    return createUserProgressService();
  }
  return context;
};

// Re-export types to maintain backward compatibility
export type { 
  UserProgress, 
  UserStreak, 
  ExerciseResult, 
  LessonScorecard, 
  ExerciseResponse 
} from './userProgress/types';

// Create the user progress service
export const createUserProgressService = () => {
  // This function now delegates to the API implementations
  return {
    getUserProgressData: async () => userProgressApi.getUserProgress(await getUserId()),
    getUserStreakData: async () => {
      const userId = await getUserId();
      return userProgressApi.getUserStreak(userId) || createDefaultStreak(userId);
    },
    updateUserStreak: async (xpEarned: number) => {
      const userId = await getUserId();
      return userProgressApi.updateUserStreak(userId, xpEarned);
    },
    updateLessonProgress: async (lessonId: string, isCompleted: boolean, accuracy: number, xpEarned: number) => {
      const userId = await getUserId();
      return userProgressApi.updateLessonProgress(userId, lessonId, isCompleted, accuracy, xpEarned);
    },
    submitExerciseResult: async (result: ExerciseResult) => {
      const userId = await getUserId();
      return userProgressApi.submitExerciseResult(userId, result);
    },
    getLessonScorecard: async (lessonId: string) => {
      const userId = await getUserId();
      return userProgressApi.getLessonScorecard(userId, lessonId);
    }
  };
};

// Helper to get the current user ID
const getUserId = async (): Promise<string> => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    throw new Error('User not authenticated');
  }
  return user.user.id;
};

// Create a default streak object for new users
const createDefaultStreak = (userId: string): UserStreak => ({
  id: '',
  user_id: userId,
  current_streak: 0,
  longest_streak: 0,
  last_activity_date: new Date().toISOString(),
  daily_xp: 0,
  total_xp: 0,
  level: 1,
  daily_goal: 50
});

// For compatibility with code that needs direct access without hooks
export const getUserProgress = () => createUserProgressService();
