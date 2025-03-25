
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  UserProgress, 
  UserStreak, 
  ExerciseResult, 
  LessonScorecard,
  ExerciseResponse
} from "./userProgress/types";
import { userProgressApi } from "./userProgress/userProgressApi";

export interface UseUserProgressReturn {
  userProgress: UserProgress[];
  userStreak: UserStreak;
  loading: boolean;
  error: string;
  getUserProgressData: () => Promise<UserProgress[]>;
  getUserStreak: () => Promise<UserStreak>;
  submitExerciseResult: (result: ExerciseResult) => Promise<boolean>;
  submitLessonCompletion: (lessonId: string, scorecard: LessonScorecard) => Promise<boolean>;
  // Add missing methods
  getUserStreakData: () => Promise<UserStreak>;
  updateLessonProgress: (lessonId: string, isCompleted: boolean, accuracy: number, xpEarned: number) => Promise<boolean>;
  updateUserStreak: (xpEarned: number) => Promise<boolean>;
  getLessonScorecard: (lessonId: string) => Promise<LessonScorecard | null>;
}

export const useUserProgress = (): UseUserProgressReturn => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userStreak, setUserStreak] = useState<UserStreak>({
    id: "",
    user_id: "",
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: "",
    daily_xp: 0,
    total_xp: 0,
    level: 1,
    daily_goal: 50
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (user) {
      getUserProgressData();
      getUserStreakData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getUserProgressData = async (): Promise<UserProgress[]> => {
    if (!user) return [];
    try {
      setLoading(true);
      const progress = await userProgressApi.getUserProgress(user.id);
      setUserProgress(progress);
      setLoading(false);
      return progress;
    } catch (err) {
      setError("Failed to load user progress");
      setLoading(false);
      return [];
    }
  };

  const getUserStreakData = async (): Promise<UserStreak> => {
    if (!user) return userStreak;
    try {
      const streak = await userProgressApi.getUserStreak(user.id);
      setUserStreak(streak);
      return streak;
    } catch (err) {
      setError("Failed to load user streak");
      return userStreak;
    }
  };

  const submitExerciseResult = async (result: ExerciseResult): Promise<boolean> => {
    if (!user) return false;
    try {
      // Ensure timeSpent property exists with a default value if not provided
      const response = await userProgressApi.saveExerciseResult(user.id, {
        ...result,
        timeSpent: result.timeSpent || 0 // Ensure timeSpent property exists
      });
      
      if (response.success && result.isCorrect) {
        await updateUserStreak(result.xpEarned);
      }
      
      return response.success;
    } catch (err) {
      console.error("Error submitting exercise result:", err);
      return false;
    }
  };

  const submitLessonCompletion = async (lessonId: string, scorecard: LessonScorecard): Promise<boolean> => {
    if (!user) return false;
    try {
      await userProgressApi.submitLessonCompletion(user.id, lessonId, scorecard);
      return true;
    } catch (err) {
      console.error("Error submitting lesson completion:", err);
      return false;
    }
  };

  const updateLessonProgress = async (
    lessonId: string, 
    isCompleted: boolean, 
    accuracy: number,
    xpEarned: number
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      await userProgressApi.updateLessonProgress(user.id, lessonId, isCompleted, accuracy, xpEarned);
      return true;
    } catch (err) {
      console.error("Error updating lesson progress:", err);
      return false;
    }
  };

  const updateUserStreak = async (xpEarned: number): Promise<boolean> => {
    if (!user) return false;
    try {
      await userProgressApi.updateUserStreak(user.id, xpEarned);
      return true;
    } catch (err) {
      console.error("Error updating user streak:", err);
      return false;
    }
  };

  const getLessonScorecard = async (lessonId: string): Promise<LessonScorecard | null> => {
    if (!user) return null;
    try {
      return await userProgressApi.getLessonScorecard(user.id, lessonId);
    } catch (err) {
      console.error("Error getting lesson scorecard:", err);
      return null;
    }
  };

  // Get user streak (alias for getUserStreakData for backwards compatibility)
  const getUserStreak = async (): Promise<UserStreak> => {
    return getUserStreakData();
  };

  return {
    userProgress,
    userStreak,
    loading,
    error,
    getUserProgressData,
    getUserStreak,
    submitExerciseResult,
    submitLessonCompletion,
    getUserStreakData,
    updateLessonProgress,
    updateUserStreak,
    getLessonScorecard
  };
};

// Export for importing in files that just need the types
export * from './userProgress/types';
