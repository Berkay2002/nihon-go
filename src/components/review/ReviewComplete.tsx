
import React from "react";
import { Button } from "@/components/ui/button";
import { ReviewSession } from "@/services/learning";
import { clearReviewSessionData } from "./ReviewSessionStorage";
import { useAuth } from "@/hooks/useAuth";

interface ReviewCompleteProps {
  reviewSession: ReviewSession;
  reviewStats: { correct: number; incorrect: number };
  onRetryReview: () => void;
}

export const ReviewComplete: React.FC<ReviewCompleteProps> = ({ 
  reviewSession, 
  reviewStats,
  onRetryReview
}) => {
  const { user } = useAuth();
  const accuracy = reviewSession.items.length > 0 
    ? Math.round((reviewStats.correct / reviewSession.items.length) * 100) 
    : 0;
  
  const handleRetryClick = () => {
    // Clear the completed session when starting a new one
    if (user) {
      clearReviewSessionData(user.id);
    }
    onRetryReview();
  };
  
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">Review Complete!</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        You've completed this review session.
      </p>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 max-w-sm mx-auto mb-8">
        <div className="flex justify-between mb-4">
          <span className="text-slate-600 dark:text-slate-400">Items Reviewed:</span>
          <span className="font-semibold">{reviewSession.items.length}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-slate-600 dark:text-slate-400">Correct Answers:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {reviewStats.correct}
          </span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-slate-600 dark:text-slate-400">Incorrect Answers:</span>
          <span className="font-semibold text-red-600 dark:text-red-400">
            {reviewStats.incorrect}
          </span>
        </div>
        <div className="flex justify-between border-t dark:border-slate-700 pt-4">
          <span className="text-slate-600 dark:text-slate-400">Accuracy:</span>
          <span className="font-semibold">{accuracy}%</span>
        </div>
      </div>
      
      <Button 
        onClick={handleRetryClick}
        className="w-full max-w-sm"
      >
        Start New Review
      </Button>
    </div>
  );
};
