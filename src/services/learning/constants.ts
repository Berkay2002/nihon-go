
// Constants for the SRS algorithm

// Difficulty multipliers
export const AGAIN_FACTOR = 0.5;       // For incorrectly answered items
export const HARD_FACTOR = 1.2;        // For correctly answered but difficult items
export const MEDIUM_FACTOR = 1.5;      // For average difficulty items
export const EASY_FACTOR = 2.5;        // For easy items

// Ease factor bounds
export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;
export const MAX_EASE_FACTOR = 3.0;

// Ease factor adjustment parameters
export const EASE_DECAY_RATE = 0.01;   // Natural decay rate to prevent perpetually high ease factors

// Learning stages
export const LEARNING_STAGE_NEW = 'new';
export const LEARNING_STAGE_LEARNING = 'learning';
export const LEARNING_STAGE_REVIEW = 'review';
export const LEARNING_STAGE_GRADUATED = 'graduated';

// Intervals for each stage transition (in days)
export const LEARNING_TO_REVIEW_THRESHOLD = 7;
export const REVIEW_TO_GRADUATED_THRESHOLD = 30;

// Consecutive correct answer thresholds
export const CONSECUTIVE_CORRECT_BONUS_THRESHOLD = 3;
export const MAX_CONSECUTIVE_BONUS = 10;

// XP rewards
export const BASE_XP_REWARD = 10;
export const STREAK_BONUS_MULTIPLIER = 0.1;  // 10% bonus per day in streak
export const MAX_STREAK_BONUS = 2.0;         // Maximum 2x multiplier
