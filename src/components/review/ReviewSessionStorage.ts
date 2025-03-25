
import { ReviewSession } from "@/services/learning";

// Constants for localStorage keys
export const REVIEW_SESSION_KEY = "review_session";
export const REVIEW_PROGRESS_KEY = "review_progress";
export const REVIEW_STATS_KEY = "review_stats";

/**
 * Save review session data to localStorage
 */
export const saveSessionToLocalStorage = (
  userId: string,
  reviewType: string,
  session: ReviewSession | null,
  index: number,
  complete: boolean,
  stats: { correct: number; incorrect: number }
) => {
  if (!userId || !session) return;
  
  try {
    const storageKey = `${REVIEW_SESSION_KEY}_${reviewType}_${userId}`;
    const progressKey = `${REVIEW_PROGRESS_KEY}_${reviewType}_${userId}`;
    const statsKey = `${REVIEW_STATS_KEY}_${reviewType}_${userId}`;
    
    localStorage.setItem(storageKey, JSON.stringify(session));
    localStorage.setItem(progressKey, JSON.stringify({
      currentIndex: index,
      complete
    }));
    localStorage.setItem(statsKey, JSON.stringify(stats));
    
    console.log(`Saved ${reviewType} review session to localStorage`, {
      currentIndex: index,
      complete,
      stats
    });
  } catch (err) {
    console.error(`Error saving ${reviewType} review session to localStorage`, err);
  }
};

/**
 * Load review session data from localStorage
 */
export const loadSavedSession = (
  userId: string,
  reviewType: string,
  setReviewSession: (session: ReviewSession) => void,
  setCurrentItemIndex: (index: number) => void,
  setReviewComplete: (complete: boolean) => void,
  setReviewStats: (stats: { correct: number; incorrect: number }) => void
): boolean => {
  if (!userId) return false;
  
  try {
    const storageKey = `${REVIEW_SESSION_KEY}_${reviewType}_${userId}`;
    const progressKey = `${REVIEW_PROGRESS_KEY}_${reviewType}_${userId}`;
    const statsKey = `${REVIEW_STATS_KEY}_${reviewType}_${userId}`;
    
    const savedSession = localStorage.getItem(storageKey);
    const savedProgress = localStorage.getItem(progressKey);
    const savedStats = localStorage.getItem(statsKey);
    
    if (savedSession && savedProgress && savedStats) {
      const parsedSession = JSON.parse(savedSession);
      const parsedProgress = JSON.parse(savedProgress);
      const parsedStats = JSON.parse(savedStats);
      
      if (parsedSession && parsedSession.items && Array.isArray(parsedSession.items)) {
        setReviewSession(parsedSession);
        setCurrentItemIndex(parsedProgress.currentIndex);
        setReviewComplete(parsedProgress.complete);
        setReviewStats(parsedStats);
        console.log(`Restored ${reviewType} review session from localStorage`, {
          currentIndex: parsedProgress.currentIndex,
          complete: parsedProgress.complete,
          stats: parsedStats
        });
        return true;
      }
    }
  } catch (err) {
    console.error(`Error loading saved ${reviewType} review session`, err);
  }
  
  return false;
};

/**
 * Clear all review session data from localStorage for a specific user
 */
export const clearReviewSessionData = (userId: string, reviewType?: string) => {
  try {
    if (reviewType) {
      // Clear specific review type data
      localStorage.removeItem(`${REVIEW_SESSION_KEY}_${reviewType}_${userId}`);
      localStorage.removeItem(`${REVIEW_PROGRESS_KEY}_${reviewType}_${userId}`);
      localStorage.removeItem(`${REVIEW_STATS_KEY}_${reviewType}_${userId}`);
      console.log(`Cleared ${reviewType} review session data for user:`, userId);
    } else {
      // Clear all review types data
      localStorage.removeItem(`${REVIEW_SESSION_KEY}_vocabulary_${userId}`);
      localStorage.removeItem(`${REVIEW_PROGRESS_KEY}_vocabulary_${userId}`);
      localStorage.removeItem(`${REVIEW_STATS_KEY}_vocabulary_${userId}`);
      
      localStorage.removeItem(`${REVIEW_SESSION_KEY}_difficult_${userId}`);
      localStorage.removeItem(`${REVIEW_PROGRESS_KEY}_difficult_${userId}`);
      localStorage.removeItem(`${REVIEW_STATS_KEY}_difficult_${userId}`);
      console.log("Cleared all review session data for user:", userId);
    }
  } catch (err) {
    console.error("Error clearing review session data", err);
  }
};

/**
 * Check if user has an in-progress review session
 */
export const hasInProgressReviewSession = (userId: string, reviewType: string): boolean => {
  try {
    const savedSession = localStorage.getItem(`${REVIEW_SESSION_KEY}_${reviewType}_${userId}`);
    const savedProgress = localStorage.getItem(`${REVIEW_PROGRESS_KEY}_${reviewType}_${userId}`);
    
    if (!savedSession || !savedProgress) return false;
    
    const progress = JSON.parse(savedProgress);
    // Consider it in-progress if we have a session and it's not marked as complete
    return !progress.complete;
  } catch (err) {
    console.error("Error checking for in-progress review session", err);
    return false;
  }
};
