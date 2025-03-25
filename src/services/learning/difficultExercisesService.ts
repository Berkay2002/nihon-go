
import { ReviewSession } from './types';
import { supabase } from "@/integrations/supabase/client";
import { getUserProgress } from "@/services/userProgressService";

/**
 * Loads difficult exercises based on user's exercise history
 */
export const loadDifficultExercisesSession = async (userId: string): Promise<ReviewSession | null> => {
  if (!userId) return null;
  
  try {
    // Get user progress data to find completed lessons
    const { data: progress } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('is_completed', true);
    
    if (!progress || progress.length === 0) {
      console.log("No completed lessons found");
      return null;
    }
    
    // Get all lessons the user has completed
    const lessonIds = progress.map(p => p.lesson_id);
    
    // For each lesson, get the scorecard to find difficult exercises
    const difficultItems = [];
    
    // Process up to 5 most recent lessons for performance
    const recentLessonIds = lessonIds.slice(0, 5);
    
    for (const lessonId of recentLessonIds) {
      try {
        const { getLessonScorecard } = getUserProgress();
        const scorecard = await getLessonScorecard(lessonId);
        
        // Find exercises where the user made mistakes
        const difficultExercises = scorecard.responses
          .filter(response => !response.is_correct)
          .map(response => ({
            item: {
              id: response.exercise_id,
              japanese: response.question || "",
              english: response.correct_answer || "",
              romaji: "",
              hiragana: "",
              category: "difficult-exercise",
              difficulty: 4, // Higher difficulty for failed exercises
              lessonId: lessonId,
              // Include exercise-specific data
              exerciseType: response.exercise_type || "multiple_choice",
              question: response.question || "",
              options: [],
              correctAnswer: response.correct_answer || "",
            },
            dueDate: new Date(),
            difficulty: 4,
            interval: 1
          }));
          
        difficultItems.push(...difficultExercises);
      } catch (err) {
        console.error(`Error getting scorecard for lesson ${lessonId}:`, err);
      }
    }
    
    // Limit to max 10 difficult items and shuffle them
    const shuffledItems = difficultItems
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
      
    if (shuffledItems.length === 0) {
      return null;
    }
    
    return {
      items: shuffledItems,
      userId: userId,
      sessionDate: new Date()
    };
  } catch (err) {
    console.error("Error creating difficult exercises session:", err);
    return null;
  }
};
