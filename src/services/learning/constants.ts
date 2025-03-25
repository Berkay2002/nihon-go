
// Constants for the SRS algorithm
export const EASY_FACTOR = 2.5;
export const MEDIUM_FACTOR = 1.5;
export const HARD_FACTOR = 1.2;
export const AGAIN_FACTOR = 0.5;

// Learning stages constants
export const LEARNING_STAGE_NEW = 'new';
export const LEARNING_STAGE_LEARNING = 'learning';
export const LEARNING_STAGE_REVIEW = 'review';
export const LEARNING_STAGE_GRADUATED = 'graduated';

// Default ease factor
export const DEFAULT_EASE_FACTOR = 2.5;

// Enhanced SRS parameters
export const MIN_EASE_FACTOR = 1.3;
export const MAX_EASE_FACTOR = 3.2;
export const EASE_DECAY_RATE = 0.01; // Natural forgetting rate
export const RETENTION_PRIORITY_DAYS = 14; // Days to prioritize recently learned items
