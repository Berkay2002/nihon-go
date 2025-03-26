
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
  consecutiveCorrect: number = 0,
  historicalPerformance: number = 0.5 // Historical success rate (0-1)
): { nextDate: Date; newInterval: number; newEaseFactor: number } => {
  // Adjust ease factor based on difficulty, long-term trends, and historical performance
  let newEaseFactor = calculateNewEaseFactor(
    difficulty, 
    wasCorrect, 
    easeFactor, 
    consecutiveCorrect,
    historicalPerformance
  );
  
  // Calculate interval multiplier based on difficulty
  let intervalMultiplier;
  
  if (!wasCorrect) {
    // If answer was wrong, use a forgiving factor based on historical performance
    // Users with good historical performance get less penalty for occasional mistakes
    intervalMultiplier = AGAIN_FACTOR * (0.8 + (historicalPerformance * 0.4));
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
  const adaptiveMultiplier = getAdaptiveMultiplier(
    currentInterval, 
    consecutiveCorrect,
    historicalPerformance
  );
  
  // Performance-adjusted multiplier
  intervalMultiplier *= (newEaseFactor / DEFAULT_EASE_FACTOR) * adaptiveMultiplier;
  
  // Calculate new interval in days (minimum 1 day)
  // For first-time correct items, start with 1 day regardless
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
  consecutiveCorrect: number,
  historicalPerformance: number
): number => {
  // Apply minimal natural decay to ease factor to prevent it from staying too high
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
    // Wrong answer - decrease more for higher ease factors, but be forgiving
    // based on historical performance
    
    // Calculate forgiveness factor based on historical performance
    // Users who generally do well get more forgiveness for occasional mistakes
    const forgivenessFactor = Math.max(0.4, historicalPerformance); // 0.4 to 1.0
    
    // Calculate base penalty
    const basePenalty = 0.2 * Math.sqrt(currentEaseFactor / MIN_EASE_FACTOR);
    
    // Apply forgiveness to the penalty
    const adjustedPenalty = basePenalty * (1 - (forgivenessFactor * 0.5));
    
    // Apply the adjusted penalty
    newEaseFactor -= adjustedPenalty;
  }
  
  // Ensure ease factor stays within bounds
  return Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEaseFactor));
};

// Get adaptive multiplier for interval calculation using logarithmic scaling
const getAdaptiveMultiplier = (
  currentInterval: number, 
  consecutiveCorrect: number,
  historicalPerformance: number
): number => {
  if (currentInterval <= 1) return 1;
  
  // Apply logarithmic scaling for longer intervals to slow down growth
  const baseMultiplier = currentInterval > 30 
    ? 1 + (0.5 * Math.log10(currentInterval / 30))
    : 1;
    
  // Adjust based on consecutive correct answers (confidence boost)
  const confidenceBoost = consecutiveCorrect > 3 
    ? 1 + (Math.min(consecutiveCorrect, 10) - 3) * 0.05 
    : 1;
  
  // Add a small boost based on overall historical performance
  const performanceBoost = 1 + (historicalPerformance * 0.1);
    
  return baseMultiplier * confidenceBoost * performanceBoost;
};

// Calculate optimal review interval for a given item difficulty
export const calculateOptimalInterval = (
  currentInterval: number,
  easeFactor: number,
  difficulty: number,
  historicalPerformance: number
): number => {
  // Base interval is current interval times ease factor
  let interval = currentInterval * (easeFactor / DEFAULT_EASE_FACTOR);
  
  // Adjust for difficulty: easier items get longer intervals
  interval *= (5 - difficulty) / 3;
  
  // Adjust for historical performance: better performers get longer intervals
  interval *= (0.8 + (historicalPerformance * 0.4));
  
  // Apply logarithmic scaling for very long intervals to prevent excessive growth
  if (interval > 60) {
    interval = 60 + (30 * Math.log10(interval / 60));
  }
  
  // Ensure minimum interval of 1 day
  return Math.max(1, Math.round(interval));
};

// Calculate performance score for analytics (0-100)
export const calculatePerformanceScore = (
  correctRate: number,
  itemsReviewed: number,
  averageEaseFactor: number
): number => {
  if (itemsReviewed === 0) return 0;
  
  // Base score from correct rate (0-80)
  const correctScore = correctRate * 80;
  
  // Bonus from ease factor (0-20)
  const easeBonus = ((averageEaseFactor - MIN_EASE_FACTOR) / 
    (MAX_EASE_FACTOR - MIN_EASE_FACTOR)) * 20;
  
  // Volume bonus - small bonus for reviewing many items
  const volumeBonus = Math.min(5, Math.log10(itemsReviewed + 1) * 2.5);
  
  return Math.min(100, Math.round(correctScore + easeBonus + volumeBonus));
};
