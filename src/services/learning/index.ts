
// Re-export all exports from the services
export * from './types';
export * from './constants';
export * from './calculationService';
export * from './dataService';
export * from './sessionService';

// For backward compatibility, create and export a default object
import { calculateNextReviewDate } from './calculationService';
import { 
  getDueReviewItems, 
  updateReviewItem, 
  addVocabularyToSrs, 
  getUserSrsStats 
} from './dataService';
import { generateReviewSession } from './sessionService';

// Combined service that mirrors the original API
const learningAlgorithmService = {
  calculateNextReviewDate,
  getDueReviewItems,
  updateReviewItem,
  addVocabularyToSrs,
  generateReviewSession,
  getUserSrsStats
};

export default learningAlgorithmService;
