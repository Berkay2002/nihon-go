
import { ReviewSession } from './types';
import { getDueReviewItems } from './dataService';

// Generate a personalized review session
export const generateReviewSession = async (userId: string, itemCount: number = 10): Promise<ReviewSession | null> => {
  try {
    const dueItems = await getDueReviewItems(userId, itemCount);
    
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
