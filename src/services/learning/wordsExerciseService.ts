
import { supabase } from "@/integrations/supabase/client";
import { ReviewSession } from './types';
import vocabularyService from '../api/vocabularyService';
import contentService from '../contentService';

export const loadWordsExerciseSession = async (userId: string): Promise<ReviewSession | null> => {
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
      return createEmptySession(userId);
    }
    
    // Get all lessons the user has completed
    const lessonIds = progress.map(p => p.lesson_id);
    
    // Get vocabulary from these lessons
    const allVocab = [];
    for (const lessonId of lessonIds) {
      try {
        const lessonVocab = await contentService.getVocabularyByLesson(lessonId);
        allVocab.push(...lessonVocab);
      } catch (err) {
        console.error(`Error fetching vocabulary for lesson ${lessonId}:`, err);
      }
    }
    
    // If no vocabulary found, return empty session
    if (allVocab.length === 0) {
      return createEmptySession(userId);
    }
    
    // Shuffle and select up to 10 vocabulary items
    const shuffledVocab = allVocab
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
      
    // Transform into review items
    const reviewItems = shuffledVocab.map(vocab => ({
      item: {
        ...vocab,
        exerciseType: "text_input" as const,
        question: `What does "${vocab.japanese}" mean in English?`,
        correctAnswer: vocab.english,
      },
      dueDate: new Date(),
      difficulty: vocab.difficulty,
      interval: 1
    }));
    
    return {
      items: reviewItems,
      userId: userId,
      sessionDate: new Date()
    };
  } catch (err) {
    console.error("Error creating words exercise session:", err);
    return createEmptySession(userId);
  }
};

const createEmptySession = (userId: string): ReviewSession => ({
  items: [],
  userId: userId,
  sessionDate: new Date()
});
