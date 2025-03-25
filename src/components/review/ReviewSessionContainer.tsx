
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import learningAlgorithmService, { ReviewSession } from "@/services/learningAlgorithmService";
import { ReviewHeader } from "@/components/shared/ReviewHeader";
import { 
  GuestPrompt,
  ReviewError,
  LoadingReviewSession,
  ReviewSessionContent
} from "@/components/review";

// Constants for localStorage keys
const REVIEW_SESSION_KEY = "review_session";
const REVIEW_PROGRESS_KEY = "review_progress";
const REVIEW_STATS_KEY = "review_stats";

export const ReviewSessionContainer: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [reviewStats, setReviewStats] = useState({ correct: 0, incorrect: 0 });

  // Load saved session from localStorage on initial component mount
  useEffect(() => {
    const loadSavedSession = () => {
      if (!user) return false;
      
      try {
        const savedSession = localStorage.getItem(`${REVIEW_SESSION_KEY}_${user.id}`);
        const savedProgress = localStorage.getItem(`${REVIEW_PROGRESS_KEY}_${user.id}`);
        const savedStats = localStorage.getItem(`${REVIEW_STATS_KEY}_${user.id}`);
        
        if (savedSession && savedProgress && savedStats) {
          const parsedSession = JSON.parse(savedSession);
          const parsedProgress = JSON.parse(savedProgress);
          const parsedStats = JSON.parse(savedStats);
          
          // Validate session data (check if it has items array)
          if (parsedSession && parsedSession.items && Array.isArray(parsedSession.items)) {
            setReviewSession(parsedSession);
            setCurrentItemIndex(parsedProgress.currentIndex);
            setReviewComplete(parsedProgress.complete);
            setReviewStats(parsedStats);
            console.log("Restored review session from localStorage", {
              currentIndex: parsedProgress.currentIndex,
              complete: parsedProgress.complete,
              stats: parsedStats
            });
            return true;
          }
        }
      } catch (err) {
        console.error("Error loading saved review session", err);
      }
      
      return false;
    };

    const loadReviewSession = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Try to load saved session first
        const hasSavedSession = loadSavedSession();
        
        // If no saved session, fetch new one
        if (!hasSavedSession) {
          console.log("Generating review session for user:", user.id);
          const session = await learningAlgorithmService.generateReviewSession(user.id);
          console.log("Session generated:", session);
          setReviewSession(session);
          
          if (!session || session.items.length === 0) {
            toast.info("No review items available", {
              description: "Complete more lessons to add vocabulary to your review queue."
            });
          } else {
            // Save the new session to localStorage
            saveSessionToLocalStorage(session, 0, false, { correct: 0, incorrect: 0 });
          }
        }
      } catch (err) {
        console.error("Error loading review session:", err);
        setError("Failed to load review items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadReviewSession();
  }, [user]);

  // Save current session state to localStorage
  const saveSessionToLocalStorage = (
    session: ReviewSession | null,
    index: number,
    complete: boolean,
    stats: { correct: number; incorrect: number }
  ) => {
    if (!user || !session) return;
    
    try {
      localStorage.setItem(`${REVIEW_SESSION_KEY}_${user.id}`, JSON.stringify(session));
      localStorage.setItem(`${REVIEW_PROGRESS_KEY}_${user.id}`, JSON.stringify({
        currentIndex: index,
        complete
      }));
      localStorage.setItem(`${REVIEW_STATS_KEY}_${user.id}`, JSON.stringify(stats));
      
      console.log("Saved review session to localStorage", {
        currentIndex: index,
        complete,
        stats
      });
    } catch (err) {
      console.error("Error saving review session to localStorage", err);
    }
  };

  const handleResponse = async (correct: boolean, difficulty: number) => {
    if (!user || !reviewSession || currentItemIndex >= reviewSession.items.length) return;
    
    const currentItem = reviewSession.items[currentItemIndex];
    
    try {
      await learningAlgorithmService.updateReviewItem(
        user.id,
        currentItem.item.id,
        correct,
        difficulty
      );
      
      // Update stats
      const newStats = {
        correct: reviewStats.correct + (correct ? 1 : 0),
        incorrect: reviewStats.incorrect + (correct ? 0 : 1)
      };
      setReviewStats(newStats);
      
      // Update progress
      const newIndex = currentItemIndex + 1;
      const isComplete = newIndex >= reviewSession.items.length;
      
      if (!isComplete) {
        setCurrentItemIndex(newIndex);
        // Save progress
        saveSessionToLocalStorage(reviewSession, newIndex, false, newStats);
      } else {
        setReviewComplete(true);
        // Save completed state
        saveSessionToLocalStorage(reviewSession, newIndex, true, newStats);
        
        toast.success("Review session completed!", {
          description: `You reviewed ${reviewSession.items.length} items.`
        });
      }
    } catch (err) {
      console.error("Error updating review item:", err);
      toast.error("Failed to save your progress");
    }
  };

  const handleRetryReview = async () => {
    setCurrentItemIndex(0);
    setReviewComplete(false);
    setReviewStats({ correct: 0, incorrect: 0 });
    
    try {
      setLoading(true);
      if (user) {
        const session = await learningAlgorithmService.generateReviewSession(user.id);
        setReviewSession(session);
        
        // Save the new session
        saveSessionToLocalStorage(session, 0, false, { correct: 0, incorrect: 0 });
      }
    } catch (err) {
      console.error("Error loading review session:", err);
      setError("Failed to load review items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingReviewSession />;
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <ReviewError error={error} />
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full px-4">
            <GuestPrompt />
          </div>
        </div>
      );
    }

    return (
      <ReviewSessionContent
        reviewSession={reviewSession}
        currentItemIndex={currentItemIndex}
        reviewStats={reviewStats}
        reviewComplete={reviewComplete}
        onRetryReview={handleRetryReview}
        handleResponse={handleResponse}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <ReviewHeader 
        title="Vocabulary Review" 
        currentIndex={currentItemIndex} 
        totalItems={reviewSession?.items.length || 0}
      />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};
