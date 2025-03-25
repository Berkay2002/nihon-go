import { supabase } from "@/integrations/supabase/client";
import contentService from '../contentService';
import { ReviewItem } from './types';
import { 
  LEARNING_STAGE_NEW, 
  LEARNING_STAGE_LEARNING, 
  LEARNING_STAGE_REVIEW, 
  LEARNING_STAGE_GRADUATED,
  DEFAULT_EASE_FACTOR
} from './constants';
import { calculateNextReviewDate } from './calculationService';

// Get vocabulary items that are due for review
export const getDueReviewItems = async (userId: string, limit: number = 20): Promise<ReviewItem[]> => {
  try {
    console.log("getDueReviewItems: Starting to fetch SRS items for user:", userId);
    
    // Check if SRS items table exists by querying it
    const { data: srsItems, error: srsError } = await supabase
      .from('srs_items')
      .select('*, vocabulary(*)')
      .eq('user_id', userId)
      .lte('next_review_date', new Date().toISOString())
      .order('next_review_date', { ascending: true })
      .limit(limit);
    
    // Log detailed information about the query results
    if (srsError) {
      console.error("SRS items fetch error:", srsError.message, srsError.details, srsError.hint);
    } else {
      console.log(`SRS items fetch success. Found ${srsItems?.length || 0} items due for review`);
    }
    
    // If the table exists and query succeeded
    if (!srsError && srsItems && srsItems.length > 0) {
      console.log("Using SRS items from database");
      // Format the items for the review session
      return srsItems.map(item => ({
        item: item.vocabulary,
        dueDate: new Date(item.next_review_date),
        difficulty: item.vocabulary.difficulty,
        interval: item.interval
      }));
    }
    
    console.log("No SRS items found in database, falling back to enhanced fallback approach");
    return getEnhancedFallbackReviewItems(userId, limit);
  } catch (error) {
    console.error('Error getting due review items:', error);
    return [];
  }
};

// Enhanced fallback method with smarter selection algorithm
const getEnhancedFallbackReviewItems = async (userId: string, limit: number): Promise<ReviewItem[]> => {
  try {
    // Get user's progress and learning history
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*, lesson_id, last_attempted_at')
      .eq('user_id', userId)
      .order('last_attempted_at', { ascending: false });
    
    if (!progress || progress.length === 0) {
      console.log("User hasn't studied any lessons yet");
      return [];
    }
    
    // Get lessons the user has studied
    const lessonIds = progress.map(p => p.lesson_id);
    console.log("User has studied lessons:", lessonIds);
    
    // Create a map of lesson completion dates
    const lessonCompletionDates = new Map();
    progress.forEach(p => {
      if (p.lesson_id && p.last_attempted_at) {
        lessonCompletionDates.set(p.lesson_id, new Date(p.last_attempted_at));
      }
    });
    
    // Get vocabulary from these lessons
    const allVocab = [];
    for (const lessonId of lessonIds) {
      const lessonVocab = await contentService.getVocabularyByLesson(lessonId);
      console.log(`Found ${lessonVocab.length} vocabulary items for lesson ${lessonId}`);
      
      // Add completion date to each vocabulary item
      const vocabWithMetadata = lessonVocab.map(vocab => ({
        ...vocab,
        completionDate: lessonCompletionDates.get(lessonId) || new Date(),
        lessonId
      }));
      
      allVocab.push(...vocabWithMetadata);
    }
    
    // Get unique vocabulary by removing duplicates
    const uniqueVocabMap = new Map();
    allVocab.forEach(vocab => {
      if (!uniqueVocabMap.has(vocab.id) || 
          uniqueVocabMap.get(vocab.id).completionDate < vocab.completionDate) {
        uniqueVocabMap.set(vocab.id, vocab);
      }
    });
    const uniqueVocab = Array.from(uniqueVocabMap.values());
    
    // Calculate days since completion for each vocab item
    const now = new Date();
    uniqueVocab.forEach(vocab => {
      const daysSinceCompletion = Math.max(0, 
        Math.floor((now.getTime() - vocab.completionDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      vocab.daysSinceCompletion = daysSinceCompletion;
    });
    
    // Calculate retention priority score for each vocabulary item
    uniqueVocab.forEach(vocab => {
      // Prioritize recently learned items that haven't been reinforced
      const recencyScore = Math.max(0, 
        RETENTION_PRIORITY_DAYS - vocab.daysSinceCompletion
      ) / RETENTION_PRIORITY_DAYS;
      
      // Weight by difficulty (higher difficulty = higher priority)
      const difficultyWeight = vocab.difficulty / 5;
      
      // Combined priority score
      vocab.priorityScore = (recencyScore * 0.7) + (difficultyWeight * 0.3);
    });
    
    // Sort by priority score (higher score first)
    const sortedVocab = [...uniqueVocab].sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Add some randomness to prevent always showing the same items
    // Take top 70% of items by priority score
    const highPriorityCount = Math.min(Math.ceil(limit * 0.7), sortedVocab.length);
    const highPriorityItems = sortedVocab.slice(0, highPriorityCount);
    
    // Take up to 30% random items from the rest, avoiding duplicates
    const remainingPool = sortedVocab.slice(highPriorityCount);
    const randomItemCount = Math.min(limit - highPriorityItems.length, remainingPool.length);
    
    // Shuffle algorithm
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    
    const randomItems = shuffleArray([...remainingPool]).slice(0, randomItemCount);
    
    // Combine high priority and random items
    const selectedItems = [...highPriorityItems, ...randomItems];
    
    // Create review items from the selected vocabulary
    const result: ReviewItem[] = selectedItems.map(item => {
      // Calculate interval based on a combination of difficulty and days since completion
      const baseDaysAhead = Math.max(1, 6 - item.difficulty);
      
      // Items learned more recently should be reviewed more soon
      const recencyFactor = item.daysSinceCompletion < 7 
        ? Math.max(0.5, 1 - (item.daysSinceCompletion / 14)) 
        : 0.5;
        
      const daysAhead = Math.max(1, Math.round(baseDaysAhead * recencyFactor));
      
      const dueDate = new Date();
      dueDate.setDate(now.getDate() + daysAhead);
      
      return {
        item: item,
        dueDate,
        difficulty: item.difficulty,
        interval: daysAhead
      };
    });
    
    console.log(`Created ${result.length} enhanced review items with priority scoring`);
    
    // No need to shuffle again as we've already sorted by priority
    return result.slice(0, limit);
  } catch (error) {
    console.error('Error creating enhanced fallback review items:', error);
    return [];
  }
};

// Update a review item based on user performance
export const updateReviewItem = async (
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
      const { nextDate, newInterval, newEaseFactor } = calculateNextReviewDate(
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
    
    return handleFallbackUpdate(userId, vocabularyId, wasCorrect, difficulty);
  } catch (error) {
    console.error('Error updating review item:', error);
    return null;
  }
};

// Fallback update method when SRS table doesn't exist
const handleFallbackUpdate = async (
  userId: string,
  vocabularyId: string,
  wasCorrect: boolean,
  difficulty: number
): Promise<ReviewItem | null> => {
  try {
    // Get the vocabulary item
    const allVocab = await contentService.getVocabularyByCategory('all');
    const vocabItem = allVocab.find(v => v.id === vocabularyId);
    
    if (!vocabItem) {
      return null;
    }
    
    // Calculate next interval (placeholder logic)
    const currentInterval = 1; // Default starting interval
    const { nextDate, newInterval } = calculateNextReviewDate(
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
    console.error('Error in fallback update:', error);
    return null;
  }
};

// Add a vocabulary item to the SRS system
export const addVocabularyToSrs = async (userId: string, vocabularyId: string): Promise<boolean> => {
  try {
    console.log(`Attempting to add vocabulary ${vocabularyId} to SRS for user ${userId}`);
    // Check if item already exists
    const { data: existingItem, error: lookupError } = await supabase
      .from('srs_items')
      .select('id')
      .eq('user_id', userId)
      .eq('vocabulary_id', vocabularyId)
      .maybeSingle();
    
    if (lookupError) {
      console.error("Error checking for existing SRS item:", lookupError);
    } else {
      console.log("Existing item check result:", existingItem ? "Found" : "Not found");
    }
    
    // Only add if the SRS items table exists and the item isn't already in it
    if (!lookupError && !existingItem) {
      // Get the vocabulary item to check its difficulty
      const vocabItems = await contentService.getVocabularyByCategory('all');
      const vocabItem = vocabItems.find(v => v.id === vocabularyId);
      
      if (!vocabItem) {
        console.error('Vocabulary item not found:', vocabularyId);
        return false;
      }
      
      // Set the initial review date (today for new items)
      const initialReviewDate = new Date();
      
      console.log(`Adding vocabulary ${vocabularyId} to SRS with initial difficulty ${vocabItem.difficulty}`);
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
      
      console.log(`Successfully added vocabulary ${vocabularyId} to SRS`);
      return true;
    }
    
    return !!existingItem; // Return true if item already exists
  } catch (error) {
    console.error('Error adding vocabulary to SRS:', error);
    return false;
  }
};

// Get SRS statistics for the user
export const getUserSrsStats = async (userId: string): Promise<{ 
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
};
