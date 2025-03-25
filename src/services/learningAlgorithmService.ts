
import contentService, { Vocabulary } from './contentService';
import { userProgressApi } from './userProgress';
import { supabase } from "@/integrations/supabase/client";

// Basic implementation of a spaced repetition system
export interface ReviewItem {
  item: Vocabulary;
  dueDate: Date;
  difficulty: number; // 1-5 where 5 is most difficult
  interval: number; // in days
}

export interface ReviewSession {
  items: ReviewItem[];
  userId: string;
  sessionDate: Date;
}

// Constants for the SRS algorithm
const EASY_FACTOR = 2.5;
const MEDIUM_FACTOR = 1.5;
const HARD_FACTOR = 1.2;
const AGAIN_FACTOR = 0.5;

// Learning stages constants
const LEARNING_STAGE_NEW = 'new';
const LEARNING_STAGE_LEARNING = 'learning';
const LEARNING_STAGE_REVIEW = 'review';
const LEARNING_STAGE_GRADUATED = 'graduated';

// Default ease factor
const DEFAULT_EASE_FACTOR = 2.5;

const learningAlgorithmService = {
  // Calculate the next review date based on difficulty and current interval
  calculateNextReviewDate: (
    difficulty: number,
    currentInterval: number,
    wasCorrect: boolean,
    easeFactor: number = DEFAULT_EASE_FACTOR
  ): { nextDate: Date; newInterval: number; newEaseFactor: number } => {
    // Adjust ease factor based on difficulty
    let newEaseFactor = easeFactor;
    
    if (wasCorrect) {
      if (difficulty <= 2) {
        // Easy - increase ease factor
        newEaseFactor = Math.min(3.0, easeFactor + 0.15);
      } else if (difficulty >= 4) {
        // Hard but correct - decrease ease factor slightly
        newEaseFactor = Math.max(1.3, easeFactor - 0.05);
      }
    } else {
      // Wrong answer - decrease ease factor more
      newEaseFactor = Math.max(1.3, easeFactor - 0.2);
    }
    
    // Calculate interval multiplier based on difficulty
    let intervalMultiplier;
    
    if (!wasCorrect) {
      // If answer was wrong, short interval
      intervalMultiplier = AGAIN_FACTOR;
    } else if (difficulty <= 2) {
      // Easy item
      intervalMultiplier = EASY_FACTOR;
    } else if (difficulty <= 3) {
      // Medium difficulty
      intervalMultiplier = MEDIUM_FACTOR;
    } else {
      // Hard item
      intervalMultiplier = HARD_FACTOR;
    }
    
    // Apply ease factor to interval calculation
    intervalMultiplier *= (newEaseFactor / DEFAULT_EASE_FACTOR);
    
    // Calculate new interval in days (minimum 1 day)
    // For first time correct items, start with 1 day regardless
    const newInterval = currentInterval === 0 && wasCorrect 
      ? 1 
      : Math.max(1, Math.round(currentInterval * intervalMultiplier));
    
    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);
    
    return { nextDate, newInterval, newEaseFactor };
  },
  
  // Get vocabulary items that are due for review
  getDueReviewItems: async (userId: string, limit: number = 20): Promise<ReviewItem[]> => {
    try {
      // Check if SRS items table exists by querying it
      const { data: srsItems, error: srsError } = await supabase
        .from('srs_items')
        .select('*, vocabulary(*)')
        .eq('user_id', userId)
        .lte('next_review_date', new Date().toISOString())
        .order('next_review_date', { ascending: true })
        .limit(limit);
      
      // If the table exists and query succeeded
      if (!srsError && srsItems && srsItems.length > 0) {
        // Format the items for the review session
        return srsItems.map(item => ({
          item: item.vocabulary,
          dueDate: new Date(item.next_review_date),
          difficulty: item.vocabulary.difficulty,
          interval: item.interval
        }));
      }
      
      // Fallback: If SRS table doesn't exist or is empty, use the simplified approach
      // Get user's progress
      const progress = await userProgressApi.getUserProgress(userId);
      
      if (!progress || progress.length === 0) {
        // User hasn't studied anything yet
        return [];
      }
      
      // Get lessons the user has studied
      const lessonIds = progress.map(p => p.lesson_id);
      
      // Get vocabulary from these lessons
      const allVocab: Vocabulary[] = [];
      for (const lessonId of lessonIds) {
        const lessonVocab = await contentService.getVocabularyByLesson(lessonId);
        allVocab.push(...lessonVocab);
      }
      
      // Simple mock algorithm for review scheduling
      // Sort by difficulty and limit the number of items
      const now = new Date();
      const reviewItems: ReviewItem[] = allVocab
        .sort((a, b) => b.difficulty - a.difficulty)
        .slice(0, limit)
        .map(item => {
          // Mock due date and interval based on difficulty
          const daysAhead = Math.max(1, 6 - item.difficulty);
          const dueDate = new Date();
          dueDate.setDate(now.getDate() + daysAhead);
          
          return {
            item,
            dueDate,
            difficulty: item.difficulty,
            interval: daysAhead
          };
        });
      
      return reviewItems;
    } catch (error) {
      console.error('Error getting due review items:', error);
      return [];
    }
  },
  
  // Update a review item based on user performance
  updateReviewItem: async (
    userId: string,
    vocabularyId: string,
    wasCorrect: boolean,
    difficulty: number
  ): Promise<ReviewItem | null> => {
    try {
      // First check if the SRS items table exists
      const { data: existingItem, error: lookupError } = await supabase
        .from('srs_items')
        .select('*')
        .eq('user_id', userId)
        .eq('vocabulary_id', vocabularyId)
        .maybeSingle();
      
      // If we can access the table and found the item
      if (!lookupError && existingItem) {
        // Calculate next interval and review date
        const { nextDate, newInterval, newEaseFactor } = learningAlgorithmService.calculateNextReviewDate(
          difficulty,
          existingItem.interval,
          wasCorrect,
          existingItem.ease_factor
        );
        
        // Determine new learning stage
        let newLearningStage = existingItem.learning_stage;
        
        if (wasCorrect) {
          if (existingItem.learning_stage === LEARNING_STAGE_NEW) {
            newLearningStage = LEARNING_STAGE_LEARNING;
          } else if (existingItem.learning_stage === LEARNING_STAGE_LEARNING && newInterval >= 7) {
            newLearningStage = LEARNING_STAGE_REVIEW;
          } else if (existingItem.learning_stage === LEARNING_STAGE_REVIEW && newInterval >= 30) {
            newLearningStage = LEARNING_STAGE_GRADUATED;
          }
        } else {
          // If wrong answer, move back to learning stage
          if (existingItem.learning_stage !== LEARNING_STAGE_NEW) {
            newLearningStage = LEARNING_STAGE_LEARNING;
          }
        }
        
        // Update the SRS item
        const { data: updatedItem, error: updateError } = await supabase
          .from('srs_items')
          .update({
            interval: newInterval,
            ease_factor: newEaseFactor,
            next_review_date: nextDate.toISOString(),
            last_review_date: new Date().toISOString(),
            review_count: existingItem.review_count + 1,
            learning_stage: newLearningStage
          })
          .eq('id', existingItem.id)
          .select('*, vocabulary(*)')
          .single();
        
        if (updateError) {
          console.error('Error updating SRS item:', updateError);
          throw updateError;
        }
        
        // Return the updated item with vocabulary data
        return {
          item: updatedItem.vocabulary,
          dueDate: new Date(updatedItem.next_review_date),
          difficulty: updatedItem.vocabulary.difficulty,
          interval: updatedItem.interval
        };
      }
      
      // If table doesn't exist or item not found, fall back to the simple method
      // Get the vocabulary item
      const allVocab = await contentService.getVocabularyByCategory('all');
      const vocabItem = allVocab.find(v => v.id === vocabularyId);
      
      if (!vocabItem) {
        return null;
      }
      
      // Calculate next interval (placeholder logic)
      const currentInterval = 1; // Default starting interval
      const { nextDate, newInterval } = learningAlgorithmService.calculateNextReviewDate(
        difficulty,
        currentInterval,
        wasCorrect
      );
      
      // In a real implementation, you would save this to the database
      
      return {
        item: vocabItem,
        dueDate: nextDate,
        difficulty,
        interval: newInterval
      };
    } catch (error) {
      console.error('Error updating review item:', error);
      return null;
    }
  },
  
  // Add a vocabulary item to the SRS system
  addVocabularyToSrs: async (userId: string, vocabularyId: string): Promise<boolean> => {
    try {
      // Check if item already exists
      const { data: existingItem, error: lookupError } = await supabase
        .from('srs_items')
        .select('id')
        .eq('user_id', userId)
        .eq('vocabulary_id', vocabularyId)
        .maybeSingle();
      
      // Only add if the SRS items table exists and the item isn't already in it
      if (!lookupError && !existingItem) {
        // Get the vocabulary item to check its difficulty
        const vocabItems = await contentService.getVocabularyByCategory('all');
        const vocabItem = vocabItems.find(v => v.id === vocabularyId);
        
        if (!vocabItem) {
          console.error('Vocabulary item not found:', vocabularyId);
          return false;
        }
        
        // Set initial difficulty based on vocabulary difficulty (1-5)
        const initialDifficulty = vocabItem.difficulty;
        
        // Set the initial review date (today for new items)
        const initialReviewDate = new Date();
        
        // Create the SRS item
        const { error: insertError } = await supabase
          .from('srs_items')
          .insert({
            user_id: userId,
            vocabulary_id: vocabularyId,
            interval: 0, // First review has no interval
            ease_factor: DEFAULT_EASE_FACTOR, // Start with default ease factor
            next_review_date: initialReviewDate.toISOString(),
            last_review_date: null, // No review yet
            review_count: 0,
            learning_stage: LEARNING_STAGE_NEW
          });
        
        if (insertError) {
          console.error('Error adding vocabulary to SRS:', insertError);
          return false;
        }
        
        return true;
      }
      
      return !!existingItem; // Return true if item already exists
    } catch (error) {
      console.error('Error adding vocabulary to SRS:', error);
      return false;
    }
  },
  
  // Generate a personalized review session
  generateReviewSession: async (userId: string, itemCount: number = 10): Promise<ReviewSession | null> => {
    try {
      const dueItems = await learningAlgorithmService.getDueReviewItems(userId, itemCount);
      
      if (dueItems.length === 0) {
        return {
          items: [],
          userId,
          sessionDate: new Date()
        };
      }
      
      return {
        items: dueItems,
        userId,
        sessionDate: new Date()
      };
    } catch (error) {
      console.error('Error generating review session:', error);
      return null;
    }
  },
  
  // Get SRS statistics for the user
  getUserSrsStats: async (userId: string): Promise<{ 
    total: number, 
    dueToday: number, 
    learningStages: Record<string, number>
  }> => {
    try {
      // Default stats if table doesn't exist
      const defaultStats = {
        total: 0,
        dueToday: 0,
        learningStages: {
          [LEARNING_STAGE_NEW]: 0,
          [LEARNING_STAGE_LEARNING]: 0,
          [LEARNING_STAGE_REVIEW]: 0,
          [LEARNING_STAGE_GRADUATED]: 0
        }
      };
      
      // Try to get stats from SRS items table
      const { data: totalItems, error: totalError } = await supabase
        .from('srs_items')
        .select('id')
        .eq('user_id', userId);
      
      if (totalError) {
        return defaultStats;
      }
      
      // Get items due today
      const today = new Date().toISOString();
      const { data: dueItems, error: dueError } = await supabase
        .from('srs_items')
        .select('id')
        .eq('user_id', userId)
        .lte('next_review_date', today);
      
      if (dueError) {
        return defaultStats;
      }
      
      // Get counts by learning stage
      const { data: stageData, error: stageError } = await supabase
        .from('srs_items')
        .select('learning_stage')
        .eq('user_id', userId);
      
      if (stageError) {
        return defaultStats;
      }
      
      // Calculate stage counts
      const stageCounts = {
        [LEARNING_STAGE_NEW]: 0,
        [LEARNING_STAGE_LEARNING]: 0,
        [LEARNING_STAGE_REVIEW]: 0,
        [LEARNING_STAGE_GRADUATED]: 0
      };
      
      stageData.forEach(item => {
        if (stageCounts[item.learning_stage] !== undefined) {
          stageCounts[item.learning_stage]++;
        }
      });
      
      return {
        total: totalItems.length,
        dueToday: dueItems.length,
        learningStages: stageCounts
      };
    } catch (error) {
      console.error('Error getting SRS stats:', error);
      return {
        total: 0,
        dueToday: 0,
        learningStages: {
          [LEARNING_STAGE_NEW]: 0,
          [LEARNING_STAGE_LEARNING]: 0,
          [LEARNING_STAGE_REVIEW]: 0,
          [LEARNING_STAGE_GRADUATED]: 0
        }
      };
    }
  }
};

export default learningAlgorithmService;
