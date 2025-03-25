
// Constants for localStorage keys
export const REVIEW_SESSION_KEY = "review_session";
export const REVIEW_PROGRESS_KEY = "review_progress";
export const REVIEW_STATS_KEY = "review_stats";

/**
 * Clear all review session data from localStorage for a specific user
 */
export const clearReviewSessionData = (userId: string) => {
  try {
    localStorage.removeItem(`${REVIEW_SESSION_KEY}_${userId}`);
    localStorage.removeItem(`${REVIEW_PROGRESS_KEY}_${userId}`);
    localStorage.removeItem(`${REVIEW_STATS_KEY}_${userId}`);
    console.log("Cleared review session data for user:", userId);
  } catch (err) {
    console.error("Error clearing review session data", err);
  }
};

/**
 * Check if user has an in-progress review session
 */
export const hasInProgressReviewSession = (userId: string): boolean => {
  try {
    const savedSession = localStorage.getItem(`${REVIEW_SESSION_KEY}_${userId}`);
    const savedProgress = localStorage.getItem(`${REVIEW_PROGRESS_KEY}_${userId}`);
    
    if (!savedSession || !savedProgress) return false;
    
    const progress = JSON.parse(savedProgress);
    // Consider it in-progress if we have a session and it's not marked as complete
    return !progress.complete;
  } catch (err) {
    console.error("Error checking for in-progress review session", err);
    return false;
  }
};
