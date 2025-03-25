
// Re-export all exports from the services
export * from './types';
export * from './constants';
export * from './calculationService';
export * from './dataService';
export * from './sessionService';

// Import supabase client for database access
import { supabase } from "@/integrations/supabase/client";

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
  getUserSrsStats,
  client: supabase // Add supabase client for direct access
};

export default learningAlgorithmService;
