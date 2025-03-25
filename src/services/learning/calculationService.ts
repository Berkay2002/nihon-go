
import { 
  AGAIN_FACTOR, 
  EASY_FACTOR, 
  MEDIUM_FACTOR, 
  HARD_FACTOR,
  DEFAULT_EASE_FACTOR,
  MIN_EASE_FACTOR,
  MAX_EASE_FACTOR,
  EASE_DECAY_RATE
} from './constants';

// Calculate the next review date based on difficulty and current interval
export const calculateNextReviewDate = (
  difficulty: number,
  currentInterval: number,
  wasCorrect: boolean,
  easeFactor: number = DEFAULT_EASE_FACTOR,
  consecutiveCorrect: number = 0
): { nextDate: Date; newInterval: number; newEaseFactor: number } => {
  // Adjust ease factor based on difficulty and long-term trends
  let newEaseFactor = calculateNewEaseFactor(difficulty, wasCorrect, easeFactor, consecutiveCorrect);
  
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
  
  // Apply ease factor and adaptive scaling to interval calculation
  const adaptiveMultiplier = getAdaptiveMultiplier(currentInterval, consecutiveCorrect);
  intervalMultiplier *= (newEaseFactor / DEFAULT_EASE_FACTOR) * adaptiveMultiplier;
  
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

// Calculate new ease factor with gradual adjustments based on performance trends
const calculateNewEaseFactor = (
  difficulty: number,
  wasCorrect: boolean,
  currentEaseFactor: number,
  consecutiveCorrect: number
): number => {
  // Apply natural decay to ease factor to prevent it from staying too high
  let newEaseFactor = currentEaseFactor * (1 - EASE_DECAY_RATE);
  
  if (wasCorrect) {
    // Increase based on difficulty and consecutive correct answers
    if (difficulty <= 2) {
      // Easy - increase ease factor, with bonus for consistent performance
      const consistencyBonus = Math.min(0.05, consecutiveCorrect * 0.01);
      newEaseFactor += 0.15 + consistencyBonus;
    } else if (difficulty >= 4) {
      // Hard but correct - smaller decrease for difficult items
      newEaseFactor -= 0.05 * (difficulty / 5); // Scale by difficulty
    }
  } else {
    // Wrong answer - decrease more for higher ease factors
    // This ensures that items that were "easy" but suddenly became difficult
    // drop faster in ease factor
    const penaltyFactor = Math.sqrt(currentEaseFactor / MIN_EASE_FACTOR);
    newEaseFactor -= 0.2 * penaltyFactor;
  }
  
  // Ensure ease factor stays within bounds
  return Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEaseFactor));
};

// Get adaptive multiplier for interval calculation using logarithmic scaling
const getAdaptiveMultiplier = (currentInterval: number, consecutiveCorrect: number): number => {
  if (currentInterval <= 1) return 1;
  
  // Apply logarithmic scaling for longer intervals to slow down growth
  const baseMultiplier = currentInterval > 30 
    ? 1 + (0.5 * Math.log10(currentInterval / 30))
    : 1;
    
  // Adjust based on consecutive correct answers (confidence boost)
  const confidenceBoost = consecutiveCorrect > 3 
    ? 1 + (Math.min(consecutiveCorrect, 10) - 3) * 0.05 
    : 1;
  
  return baseMultiplier * confidenceBoost;
};
