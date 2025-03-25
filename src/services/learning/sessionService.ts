
import { ReviewSession } from './types';
import { getDueReviewItems } from './dataService';

// Generate a personalized review session
export const generateReviewSession = async (userId: string, itemCount: number = 10): Promise<ReviewSession | null> => {
  try {
    const dueItems = await getDueReviewItems(userId, itemCount);
    
    // If no items are found, return a valid session with empty items array
    // This allows the UI to show a proper "no items" message
    return {
      items: dueItems,
      userId,
      sessionDate: new Date()
    };
  } catch (error) {
    console.error('Error generating review session:', error);
    return null;
  }
};
