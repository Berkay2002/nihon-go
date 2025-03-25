
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReviewHeader } from "@/components/shared/ReviewHeader";
import { ReviewSessionContent } from "@/components/review/ReviewSessionContent";
import { ReviewSession } from "@/services/learning/types";
import { loadMistakesExerciseSession } from "@/services/learning/mistakesExerciseService";
import { loadWordsExerciseSession } from "@/services/learning/wordsExerciseService";
import { LoadingReviewSession, GuestPrompt, ReviewError } from "@/components/review";
import { toast } from "sonner";

interface PracticeParams {
  type: string;
}

const Practice = () => {
  const { type } = useParams<keyof PracticeParams>() as { type: string };
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceSession, setPracticeSession] = useState<ReviewSession | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [reviewStats, setReviewStats] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    const loadSession = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let session = null;
        
        switch (type) {
          case "mistakes":
            session = await loadMistakesExerciseSession(user.id);
            break;
          case "words":
            session = await loadWordsExerciseSession(user.id);
            break;
          default:
            setError(`Unknown practice type: ${type}`);
            return;
        }
        
        setPracticeSession(session);
        
        if (!session || session.items.length === 0) {
          let message = "No practice items available.";
          
          if (type === "mistakes") {
            message = "No mistakes found to practice. Complete more lessons to generate practice material.";
          } else if (type === "words") {
            message = "No vocabulary words available. Complete more lessons to unlock vocabulary practice.";
          }
          
          toast.info("No practice items available", { description: message });
        }
      } catch (err) {
        console.error(`Error loading ${type} practice session:`, err);
        setError(`Failed to load practice items. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [user, type]);

  const handleResponse = async (correct: boolean, difficulty: number) => {
    if (!user || !practiceSession || currentItemIndex >= practiceSession.items.length) return;
    
    const newStats = {
      correct: reviewStats.correct + (correct ? 1 : 0),
      incorrect: reviewStats.incorrect + (correct ? 0 : 1)
    };
    setReviewStats(newStats);
    
    const newIndex = currentItemIndex + 1;
    const isComplete = newIndex >= practiceSession.items.length;
    
    if (!isComplete) {
      setCurrentItemIndex(newIndex);
    } else {
      setReviewComplete(true);
      toast.success(`Practice session completed!`, {
        description: `You completed ${practiceSession.items.length} items.`
      });
    }
  };

  const handleRetryPractice = async () => {
    setCurrentItemIndex(0);
    setReviewComplete(false);
    setReviewStats({ correct: 0, incorrect: 0 });
    
    try {
      setLoading(true);
      if (user) {
        let session = null;
        
        if (type === "mistakes") {
          session = await loadMistakesExerciseSession(user.id);
        } else if (type === "words") {
          session = await loadWordsExerciseSession(user.id);
        }
        
        setPracticeSession(session);
      }
    } catch (err) {
      console.error(`Error loading ${type} practice session:`, err);
      setError(`Failed to load practice items. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case "mistakes":
        return "Mistakes Practice";
      case "words":
        return "Vocabulary Practice";
      default:
        return "Practice";
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
        reviewSession={practiceSession}
        currentItemIndex={currentItemIndex}
        reviewStats={reviewStats}
        reviewComplete={reviewComplete}
        onRetryReview={handleRetryPractice}
        handleResponse={handleResponse}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <ReviewHeader 
        title={getTitle()} 
        currentIndex={currentItemIndex} 
        totalItems={practiceSession?.items.length || 0}
      />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Practice;
