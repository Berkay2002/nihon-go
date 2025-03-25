
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { ReviewHeader } from "@/components/shared/ReviewHeader";
import { 
  GuestPrompt,
  ReviewError,
  LoadingReviewSession,
  ReviewSessionContent
} from "@/components/review";
import { useReviewSession } from "@/hooks/useReviewSession";

interface ReviewSessionContainerProps {
  reviewType?: "vocabulary" | "difficult";
}

export const ReviewSessionContainer: React.FC<ReviewSessionContainerProps> = ({ 
  reviewType = "vocabulary" 
}) => {
  const { user } = useAuth();
  const {
    loading,
    error,
    reviewSession,
    currentItemIndex,
    reviewComplete,
    reviewStats,
    handleResponse,
    handleRetryReview
  } = useReviewSession(reviewType);

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
