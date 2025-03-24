
import contentService, { Vocabulary } from './contentService';
import userProgressService, { UserProgress } from './userProgressService';

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

const EASY_FACTOR = 2.5;
const MEDIUM_FACTOR = 1.5;
const HARD_FACTOR = 1.2;

const learningAlgorithmService = {
  // Calculate the next review date based on difficulty and current interval
  calculateNextReviewDate: (
    difficulty: number,
    currentInterval: number,
    wasCorrect: boolean
  ): { nextDate: Date; newInterval: number } => {
    // Simple algorithm: interval increases based on difficulty level and correctness
    let intervalMultiplier;
    
    if (!wasCorrect) {
      // If answer was wrong, short interval
      intervalMultiplier = 0.5;
    } else if (difficulty <= 2) {
      // Easy item
      intervalMultiplier = EASY_FACTOR;
    } else if (difficulty <= 4) {
      // Medium difficulty
      intervalMultiplier = MEDIUM_FACTOR;
    } else {
      // Hard item
      intervalMultiplier = HARD_FACTOR;
    }
    
    // Calculate new interval in days (minimum 1 day)
    const newInterval = Math.max(1, Math.round(currentInterval * intervalMultiplier));
    
    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);
    
    return { nextDate, newInterval };
  },
  
  // Get vocabulary items that are due for review
  getDueReviewItems: async (userId: string, limit: number = 20): Promise<ReviewItem[]> => {
    // This is a placeholder implementation
    // In a real SRS, you would store review data in the database
    // For now, we'll simply get recent items the user has studied
    
    try {
      // Get user's progress
      const progress = await userProgressService.getUserProgress(userId);
      
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
    // This is a placeholder implementation
    // In a real system, you would store and update this data in the database
    
    try {
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
  
  // Generate a personalized review session
  generateReviewSession: async (userId: string, itemCount: number = 10): Promise<ReviewSession | null> => {
    try {
      const dueItems = await learningAlgorithmService.getDueReviewItems(userId, itemCount);
      
      if (dueItems.length === 0) {
        return null;
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
  }
};

export default learningAlgorithmService;
