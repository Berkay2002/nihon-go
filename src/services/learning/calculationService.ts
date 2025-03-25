
import { 
  AGAIN_FACTOR, 
  EASY_FACTOR, 
  MEDIUM_FACTOR, 
  HARD_FACTOR,
  DEFAULT_EASE_FACTOR
} from './constants';

// Calculate the next review date based on difficulty and current interval
export const calculateNextReviewDate = (
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
};
