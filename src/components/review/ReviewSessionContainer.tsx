import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import learningAlgorithmService, { ReviewSession } from "@/services/learning";
import { ReviewHeader } from "@/components/shared/ReviewHeader";
import { 
  GuestPrompt,
  ReviewError,
  LoadingReviewSession,
  ReviewSessionContent
} from "@/components/review";
import { useUserProgress } from "@/services/userProgressService";

// Constants for localStorage keys
const REVIEW_SESSION_KEY = "review_session";
const REVIEW_PROGRESS_KEY = "review_progress";
const REVIEW_STATS_KEY = "review_stats";

interface ReviewSessionContainerProps {
  reviewType?: "vocabulary" | "difficult";
}

export const ReviewSessionContainer: React.FC<ReviewSessionContainerProps> = ({ 
  reviewType = "vocabulary" 
}) => {
  const { user } = useAuth();
  const { getLessonScorecard } = useUserProgress();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [reviewStats, setReviewStats] = useState({ correct: 0, incorrect: 0 });

  const loadDifficultExercisesSession = async () => {
    if (!user) return null;
    
    try {
      // Get user progress data to find completed lessons
      const { data: progress } = await learningAlgorithmService.client
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('is_completed', true);
      
      if (!progress || progress.length === 0) {
        console.log("No completed lessons found");
        return null;
      }
      
      // Get all lessons the user has completed
      const lessonIds = progress.map(p => p.lesson_id);
      
      // For each lesson, get the scorecard to find difficult exercises
      const difficultItems = [];
      
      // Process up to 5 most recent lessons for performance
      const recentLessonIds = lessonIds.slice(0, 5);
      
      for (const lessonId of recentLessonIds) {
        try {
          const scorecard = await getLessonScorecard(lessonId);
          
          // Find exercises where the user made mistakes
          const difficultExercises = scorecard.responses
            .filter(response => !response.is_correct)
            .map(response => ({
              item: {
                id: response.exercise_id,
                japanese: response.question || "",
                english: response.correct_answer || "",
                romaji: "",
                hiragana: "",
                category: "difficult-exercise",
                difficulty: 4, // Higher difficulty for failed exercises
                lessonId: lessonId,
                // Include exercise-specific data
                exerciseType: response.exercise_type || "multiple_choice",
                question: response.question || "",
                options: [],
                correctAnswer: response.correct_answer || "",
              },
              dueDate: new Date(),
              difficulty: 4,
              interval: 1
            }));
            
          difficultItems.push(...difficultExercises);
        } catch (err) {
          console.error(`Error getting scorecard for lesson ${lessonId}:`, err);
        }
      }
      
      // Limit to max 10 difficult items and shuffle them
      const shuffledItems = difficultItems
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
        
      if (shuffledItems.length === 0) {
        return null;
      }
      
      return {
        items: shuffledItems,
        userId: user.id,
        sessionDate: new Date()
      };
    } catch (err) {
      console.error("Error creating difficult exercises session:", err);
      return null;
    }
  };

  useEffect(() => {
    const loadSavedSession = () => {
      if (!user) return false;
      
      try {
        const storageKey = `${REVIEW_SESSION_KEY}_${reviewType}_${user.id}`;
        const progressKey = `${REVIEW_PROGRESS_KEY}_${reviewType}_${user.id}`;
        const statsKey = `${REVIEW_STATS_KEY}_${reviewType}_${user.id}`;
        
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

    const loadReviewSession = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const hasSavedSession = loadSavedSession();
        
        if (!hasSavedSession) {
          console.log(`Generating ${reviewType} session for user:`, user.id);
          
          let session = null;
          
          if (reviewType === "vocabulary") {
            session = await learningAlgorithmService.generateReviewSession(user.id);
          } else if (reviewType === "difficult") {
            session = await loadDifficultExercisesSession();
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
            saveSessionToLocalStorage(session, 0, false, { correct: 0, incorrect: 0 });
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
  }, [user, reviewType, getLessonScorecard]);

  const saveSessionToLocalStorage = (
    session: ReviewSession | null,
    index: number,
    complete: boolean,
    stats: { correct: number; incorrect: number }
  ) => {
    if (!user || !session) return;
    
    try {
      const storageKey = `${REVIEW_SESSION_KEY}_${reviewType}_${user.id}`;
      const progressKey = `${REVIEW_PROGRESS_KEY}_${reviewType}_${user.id}`;
      const statsKey = `${REVIEW_STATS_KEY}_${reviewType}_${user.id}`;
      
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
        saveSessionToLocalStorage(reviewSession, newIndex, false, newStats);
      } else {
        setReviewComplete(true);
        saveSessionToLocalStorage(reviewSession, newIndex, true, newStats);
        
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
          session = await loadDifficultExercisesSession();
        }
        
        setReviewSession(session);
        
        saveSessionToLocalStorage(session, 0, false, { correct: 0, incorrect: 0 });
      }
    } catch (err) {
      console.error(`Error loading ${reviewType} session:`, err);
      setError(`Failed to load ${reviewType === "vocabulary" ? "review items" : "difficult exercises"}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    return reviewType === "vocabulary" ? "Vocabulary Review" : "Difficult Exercises";
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
        title={getTitle()} 
        currentIndex={currentItemIndex} 
        totalItems={reviewSession?.items.length || 0}
      />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};
