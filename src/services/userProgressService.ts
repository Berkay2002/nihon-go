
import { supabase } from "@/integrations/supabase/client";
import { createContext, useContext, useState } from 'react';

// Types for user progress data
export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  accuracy: number;
  xp_earned: number;
  last_attempted_at: string;
}

// Types for user streak data
export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  daily_xp: number;
  total_xp: number;
  level: number;
  daily_goal: number;
}

// Types for exercise result
export interface ExerciseResult {
  lessonId: string;
  exerciseId: string;
  isCorrect: boolean;
  userAnswer: string;
  timeSpent: number;
  xpEarned: number;
}

// Types for lesson scorecard
export interface ExerciseResponse {
  exercise_id: string;
  is_correct: boolean;
  question: string;
  correct_answer: string;
  user_answer: string;
  exercise_type: string;
}

export interface LessonScorecard {
  lessonId: string;
  accuracy: number;
  responses: ExerciseResponse[];
  totalExercises?: number;
  correctExercises?: number;
  xpEarned?: number;
}

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

// Create the user progress service
export const createUserProgressService = () => {
  const [scorecards, setScorecards] = useState<Record<string, LessonScorecard>>({});

  // Get user progress data
  const getUserProgressData = async (): Promise<UserProgress[]> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error fetching user progress:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserProgressData:', error);
      return [];
    }
  };

  // Get user streak data
  const getUserStreakData = async (): Promise<UserStreak> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return {
          id: '',
          user_id: '',
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: new Date().toISOString(),
          daily_xp: 0,
          total_xp: 0,
          level: 1,
          daily_goal: 50
        };
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error) {
        console.error('Error fetching user streak:', error);
        return {
          id: '',
          user_id: user.user.id,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: new Date().toISOString(),
          daily_xp: 0,
          total_xp: 0,
          level: 1,
          daily_goal: 50
        };
      }

      return data;
    } catch (error) {
      console.error('Error in getUserStreakData:', error);
      return {
        id: '',
        user_id: '',
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: new Date().toISOString(),
        daily_xp: 0,
        total_xp: 0,
        level: 1,
        daily_goal: 50
      };
    }
  };

  // Update user streak
  const updateUserStreak = async (xpEarned: number): Promise<UserStreak | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return null;
      }

      const streakData = await getUserStreakData();
      if (!streakData.id) {
        // Create new streak record if none exists
        const { data: newStreak, error: createError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.user.id,
            current_streak: 1,
            longest_streak: 1,
            total_xp: xpEarned,
            daily_xp: xpEarned,
            level: 1
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user streak:', createError);
          return null;
        }

        return newStreak;
      }

      // Update existing streak
      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = new Date(streakData.last_activity_date).toISOString().split('T')[0];
      
      let newCurrentStreak = streakData.current_streak;
      let newLongestStreak = streakData.longest_streak;
      
      if (lastActivityDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActivityDate === yesterdayStr) {
          // User was active yesterday, increment streak
          newCurrentStreak += 1;
          if (newCurrentStreak > newLongestStreak) {
            newLongestStreak = newCurrentStreak;
          }
        } else {
          // User missed a day, reset streak
          newCurrentStreak = 1;
        }
      }
      
      const newTotalXp = streakData.total_xp + xpEarned;
      const newLevel = Math.floor(newTotalXp / 100) + 1;
      
      const { data: updatedStreak, error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          daily_xp: lastActivityDate === today ? streakData.daily_xp + xpEarned : xpEarned,
          total_xp: newTotalXp,
          level: newLevel
        })
        .eq('id', streakData.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating user streak:', updateError);
        return null;
      }
      
      return updatedStreak;
    } catch (error) {
      console.error('Error in updateUserStreak:', error);
      return null;
    }
  };

  // Update lesson progress
  const updateLessonProgress = async (
    lessonId: string,
    isCompleted: boolean,
    accuracy: number,
    xpEarned: number
  ): Promise<void> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return;
      }

      // Check if progress already exists
      const { data: existingProgress, error: queryError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (queryError) {
        console.error('Error querying lesson progress:', queryError);
        return;
      }

      if (existingProgress) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            is_completed: isCompleted,
            accuracy: accuracy,
            xp_earned: existingProgress.is_completed ? existingProgress.xp_earned : xpEarned, // Only update XP if not previously completed
            last_attempted_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (updateError) {
          console.error('Error updating lesson progress:', updateError);
        }
      } else {
        // Create new progress
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.user.id,
            lesson_id: lessonId,
            is_completed: isCompleted,
            accuracy: accuracy,
            xp_earned: xpEarned,
            last_attempted_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating lesson progress:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in updateLessonProgress:', error);
    }
  };

  // Submit exercise result
  const submitExerciseResult = async (result: ExerciseResult): Promise<void> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return;
      }

      // First update the user progress for this lesson
      const existingProgress = await getUserProgressData().then(
        progresses => progresses.find(p => p.lesson_id === result.lessonId)
      );

      // If this is a first-time completion, update streak and award XP
      if (result.xpEarned > 0 && (!existingProgress || !existingProgress.is_completed)) {
        await updateUserStreak(result.xpEarned);
      }

      // Get existing exercise responses for this lesson to calculate accuracy
      let correctResponses = 0;
      let totalResponses = 1; // Include current response

      // Not all databases have exercise_responses table yet
      try {
        // Try to insert the exercise response
        await supabase
          .from('exercise_responses')
          .insert({
            user_id: user.user.id,
            lesson_id: result.lessonId,
            exercise_id: result.exerciseId,
            is_correct: result.isCorrect,
            user_answer: result.userAnswer,
            question: "Question data", // Would normally come from the exercise
            correct_answer: "Correct answer", // Would normally come from the exercise
            exercise_type: "multiple_choice" // Default type
          });
      } catch (error) {
        // Silently handle if table doesn't exist yet
        console.warn('Exercise responses not recorded - table might not exist');
      }

      // Calculate completion status
      const isLessonCompleted = result.exerciseId === 'final-exercise' || (existingProgress?.is_completed || false);
      
      // Calculate accuracy
      const accuracy = existingProgress?.accuracy || (result.isCorrect ? 100 : 0);
      
      // Update lesson progress
      await updateLessonProgress(
        result.lessonId,
        isLessonCompleted,
        accuracy,
        result.xpEarned
      );
    } catch (error) {
      console.error('Error submitting exercise result:', error);
    }
  };

  // Get the scorecard for a specific lesson
  const getLessonScorecard = async (lessonId: string): Promise<LessonScorecard> => {
    // Check if we already have this scorecard in memory
    if (scorecards[lessonId]) {
      return scorecards[lessonId];
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      // Try to get exercise responses if the table exists
      let responses: ExerciseResponse[] = [];
      let correctCount = 0;
      let totalCount = 0;

      try {
        // This might fail if the table doesn't exist
        const { data } = await supabase.rpc('get_exercise_responses', {
          p_lesson_id: lessonId,
          p_user_id: user.user.id
        });

        if (data && Array.isArray(data)) {
          responses = data.map(r => ({
            exercise_id: r.exercise_id,
            is_correct: r.is_correct,
            question: r.question || '',
            correct_answer: r.correct_answer || '',
            user_answer: r.user_answer || '',
            exercise_type: r.exercise_type || 'unknown'
          }));
          
          correctCount = responses.filter(r => r.is_correct).length;
          totalCount = responses.length;
        }
      } catch (e) {
        // Table might not exist, or RPC function might not exist
        console.warn('Could not get exercise responses:', e);
        
        // Fallback to getting the lesson progress
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.user.id)
          .eq('lesson_id', lessonId)
          .maybeSingle();
          
        if (progressData) {
          // Use the recorded accuracy
          correctCount = Math.round((progressData.accuracy / 100) * 10); // Assume 10 exercises
          totalCount = 10; // Placeholder
        }
      }

      // Get user progress for this lesson to get accuracy
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      const accuracy = progressData?.accuracy || 0;
      const xpEarned = progressData?.xp_earned || 0;

      const scorecard: LessonScorecard = {
        lessonId,
        accuracy,
        responses,
        totalExercises: totalCount,
        correctExercises: correctCount,
        xpEarned
      };

      // Cache the scorecard
      setScorecards(prev => ({
        ...prev,
        [lessonId]: scorecard
      }));

      return scorecard;
    } catch (error) {
      console.error('Error fetching lesson scorecard:', error);
      
      // Return an empty scorecard on error
      return {
        lessonId,
        accuracy: 0,
        responses: [],
        totalExercises: 0,
        correctExercises: 0,
        xpEarned: 0
      };
    }
  };

  return {
    getUserProgressData,
    getUserStreakData,
    updateUserStreak,
    updateLessonProgress,
    submitExerciseResult,
    getLessonScorecard
  };
};

// For compatibility with code that needs direct access without hooks
export const getUserProgress = () => createUserProgressService();
