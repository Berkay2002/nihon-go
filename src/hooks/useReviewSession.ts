
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import learningAlgorithmService, { ReviewSession } from "@/services/learning";
import { loadDifficultExercisesSession } from "@/services/learning/difficultExercisesService";
import { 
  saveSessionToLocalStorage, 
  loadSavedSession 
} from "@/components/review/ReviewSessionStorage";

/**
 * Custom hook to manage review session state and loading
 */
export const useReviewSession = (reviewType: "vocabulary" | "difficult" = "vocabulary") => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [reviewStats, setReviewStats] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    const loadReviewSession = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const hasSavedSession = loadSavedSession(
          user.id, 
          reviewType, 
          setReviewSession, 
          setCurrentItemIndex, 
          setReviewComplete, 
          setReviewStats
        );
        
        if (!hasSavedSession) {
          console.log(`Generating ${reviewType} session for user:`, user.id);
          
          let session = null;
          
          if (reviewType === "vocabulary") {
            session = await learningAlgorithmService.generateReviewSession(user.id);
          } else if (reviewType === "difficult") {
            session = await loadDifficultExercisesSession(user.id);
          }
          
          console.log(`${reviewType} session generated:`, session);
          setReviewSession(session);
          
          if (!session || session.items.length === 0) {
            const message = reviewType === "vocabulary"
              ? "No review items available. Complete more lessons to add vocabulary to your review queue."
              : "No difficult exercises found. As you complete more lessons, exercises you find challenging will appear here.";
              
            toast.info(`No ${reviewType === "vocabulary" ? "review items" : "difficult exercises"} available`, {
              description: message
            });
          } else {
            saveSessionToLocalStorage(user.id, reviewType, session, 0, false, { correct: 0, incorrect: 0 });
          }
        }
      } catch (err) {
        console.error(`Error loading ${reviewType} session:`, err);
        setError(`Failed to load ${reviewType === "vocabulary" ? "review items" : "difficult exercises"}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    loadReviewSession();
  }, [user, reviewType]);

  const handleResponse = async (correct: boolean, difficulty: number) => {
    if (!user || !reviewSession || currentItemIndex >= reviewSession.items.length) return;
    
    const currentItem = reviewSession.items[currentItemIndex];
    
    try {
      if (reviewType === "vocabulary") {
        await learningAlgorithmService.updateReviewItem(
          user.id,
          currentItem.item.id,
          correct,
          difficulty
        );
      }
      
      const newStats = {
        correct: reviewStats.correct + (correct ? 1 : 0),
        incorrect: reviewStats.incorrect + (correct ? 0 : 1)
      };
      setReviewStats(newStats);
      
      const newIndex = currentItemIndex + 1;
      const isComplete = newIndex >= reviewSession.items.length;
      
      if (!isComplete) {
        setCurrentItemIndex(newIndex);
        saveSessionToLocalStorage(user.id, reviewType, reviewSession, newIndex, false, newStats);
      } else {
        setReviewComplete(true);
        saveSessionToLocalStorage(user.id, reviewType, reviewSession, newIndex, true, newStats);
        
        toast.success(`${reviewType === "vocabulary" ? "Review" : "Practice"} session completed!`, {
          description: `You ${reviewType === "vocabulary" ? "reviewed" : "practiced"} ${reviewSession.items.length} items.`
        });
      }
    } catch (err) {
      console.error(`Error updating ${reviewType} item:`, err);
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
        let session = null;
        
        if (reviewType === "vocabulary") {
          session = await learningAlgorithmService.generateReviewSession(user.id);
        } else if (reviewType === "difficult") {
          session = await loadDifficultExercisesSession(user.id);
        }
        
        setReviewSession(session);
        
        saveSessionToLocalStorage(user.id, reviewType, session, 0, false, { correct: 0, incorrect: 0 });
      }
    } catch (err) {
      console.error(`Error loading ${reviewType} session:`, err);
      setError(`Failed to load ${reviewType === "vocabulary" ? "review items" : "difficult exercises"}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    reviewSession,
    currentItemIndex,
    reviewComplete,
    reviewStats,
    handleResponse,
    handleRetryReview
  };
};
