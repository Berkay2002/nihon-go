
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ReviewSession } from "@/services/learning/types";
import { 
  ReviewQuestion, 
  ReviewComplete, 
  NoReviewItems 
} from "@/components/review";

interface ReviewSessionContentProps {
  reviewSession: ReviewSession | null;
  currentItemIndex: number;
  reviewStats: { correct: number; incorrect: number };
  reviewComplete: boolean;
  onRetryReview: () => void;
  handleResponse: (correct: boolean, difficulty: number) => Promise<void>;
}

export const ReviewSessionContent: React.FC<ReviewSessionContentProps> = ({
  reviewSession,
  currentItemIndex,
  reviewStats,
  reviewComplete,
  onRetryReview,
  handleResponse
}) => {
  const navigate = useNavigate();

  if (!reviewSession) {
    return null;
  }

  if (reviewSession.items.length === 0) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
        <NoReviewItems />
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
        <ReviewComplete 
          reviewSession={reviewSession}
          reviewStats={reviewStats}
          onRetryReview={onRetryReview}
        />
      </div>
    );
  }

  if (reviewSession && currentItemIndex < reviewSession.items.length) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
        <ReviewQuestion
          currentItem={reviewSession.items[currentItemIndex]}
          onAnswer={handleResponse}
          reviewStats={reviewStats}
          currentIndex={currentItemIndex}
          totalItems={reviewSession.items.length}
        />
      </div>
    );
  }

  return null;
};
