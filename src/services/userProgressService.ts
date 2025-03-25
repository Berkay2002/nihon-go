
import { supabase } from "@/integrations/supabase/client";
import { createContext, useContext, useState } from 'react';

// Types for lesson scorecard
export type ExerciseResponse = {
  exercise_id: string;
  is_correct: boolean;
  question: string;
  correct_answer: string;
  user_answer: string;
  exercise_type: string;
};

export type LessonScorecard = {
  lessonId: string;
  accuracy: number;
  responses: ExerciseResponse[];
};

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

  // Get the scorecard for a specific lesson
  const getLessonScorecard = async (lessonId: string): Promise<LessonScorecard> => {
    // Check if we already have this scorecard in memory
    if (scorecards[lessonId]) {
      return scorecards[lessonId];
    }

    try {
      // Fetch exercise responses for this lesson
      const { data, error } = await supabase
        .from('exercise_responses')
        .select('*')
        .eq('lesson_id', lessonId);

      if (error) {
        throw error;
      }

      // Build the scorecard
      const correctResponses = data?.filter(r => r.is_correct) || [];
      const totalResponses = data?.length || 0;
      const accuracy = totalResponses > 0 ? (correctResponses.length / totalResponses) * 100 : 0;

      const responses: ExerciseResponse[] = data?.map(r => ({
        exercise_id: r.exercise_id,
        is_correct: r.is_correct,
        question: r.question || '',
        correct_answer: r.correct_answer || '',
        user_answer: r.user_answer || '',
        exercise_type: r.exercise_type || 'unknown'
      })) || [];

      const scorecard: LessonScorecard = {
        lessonId,
        accuracy,
        responses
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
        responses: []
      };
    }
  };

  return {
    getLessonScorecard
  };
};
