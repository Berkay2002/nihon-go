
import { useState, useCallback } from 'react';
import { UserProgress, UserStreak, ExerciseResult, LessonScorecard } from './userProgress/types';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { userProgressApi } from './userProgress/userProgressApi';

export const useUserProgress = () => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getUserProgressData = useCallback(async (): Promise<UserProgress[]> => {
    if (!user) {
      console.warn('Cannot fetch user progress: User not authenticated');
      return [];
    }

    try {
      setLoading(true);
      const progress = await userProgressApi.getUserProgress(user.id);
      setUserProgress(progress);
      return progress;
    } catch (err) {
      console.error('Error fetching user progress:', err);
      setError('Failed to fetch user progress.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getUserStreak = useCallback(async (): Promise<UserStreak | null> => {
    if (!user) {
      console.warn('Cannot fetch user streak: User not authenticated');
      return null;
    }

    try {
      setLoading(true);
      const streak = await userProgressApi.getUserStreak(user.id);
      setUserStreak(streak);
      return streak;
    } catch (err) {
      console.error('Error fetching user streak:', err);
      setError('Failed to fetch user streak.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Added alias for compatibility
  const getUserStreakData = getUserStreak;

  const submitExerciseResult = useCallback(async (
    result: ExerciseResult
  ): Promise<void> => {
    if (!user) {
      console.warn('Cannot submit exercise result: User not authenticated');
      return;
    }

    try {
      await userProgressApi.submitExerciseResult(user.id, result);
    } catch (err) {
      console.error('Error submitting exercise result:', err);
      toast.error('Failed to save your progress');
    }
  }, [user]);

  const submitLessonCompletion = useCallback(async (
    lessonId: string, 
    scorecard: LessonScorecard
  ): Promise<void> => {
    if (!user) {
      console.warn('Cannot submit lesson completion: User not authenticated');
      return;
    }

    try {
      await userProgressApi.submitLessonCompletion(user.id, lessonId, scorecard);
      // Refresh user progress after submitting
      await getUserProgressData();
      // Refresh streak data after lesson completion
      await getUserStreak();
    } catch (err) {
      console.error('Error submitting lesson completion:', err);
      toast.error('Failed to save your lesson completion');
    }
  }, [user, getUserProgressData, getUserStreak]);
  
  // Add missing methods for compatibility with existing code
  const updateLessonProgress = useCallback(async (
    lessonId: string,
    isCompleted: boolean,
    accuracy: number,
    xpEarned: number
  ): Promise<void> => {
    if (!user) {
      console.warn('Cannot update lesson progress: User not authenticated');
      return;
    }

    try {
      await userProgressApi.updateLessonProgress(user.id, lessonId, isCompleted, accuracy, xpEarned);
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      toast.error('Failed to update your progress');
    }
  }, [user]);
  
  const updateUserStreak = useCallback(async (
    xpEarned: number,
    extendStreak: boolean = true
  ): Promise<UserStreak | null> => {
    if (!user) {
      console.warn('Cannot update user streak: User not authenticated');
      return null;
    }

    try {
      return await userProgressApi.updateUserStreak(user.id, xpEarned, extendStreak);
    } catch (err) {
      console.error('Error updating user streak:', err);
      toast.error('Failed to update your streak');
      return null;
    }
  }, [user]);
  
  const getLessonScorecard = useCallback(async (
    lessonId: string
  ): Promise<LessonScorecard> => {
    if (!user) {
      console.warn('Cannot get lesson scorecard: User not authenticated');
      return {
        lessonId,
        totalExercises: 0,
        correctExercises: 0,
        accuracy: 0,
        xpEarned: 0,
        responses: []
      };
    }

    try {
      return await userProgressApi.getLessonScorecard(user.id, lessonId);
    } catch (err) {
      console.error('Error getting lesson scorecard:', err);
      return {
        lessonId,
        totalExercises: 0,
        correctExercises: 0,
        accuracy: 0,
        xpEarned: 0,
        responses: []
      };
    }
  }, [user]);

  return {
    userProgress,
    userStreak,
    loading,
    error,
    getUserProgressData,
    getUserStreak,
    getUserStreakData,
    submitExerciseResult,
    submitLessonCompletion,
    updateLessonProgress,
    updateUserStreak,
    getLessonScorecard
  };
};
