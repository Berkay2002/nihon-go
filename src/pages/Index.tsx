
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import learningAlgorithmService, { ReviewSession } from "@/services/learningAlgorithmService";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ReviewHeader } from "@/components/shared/ReviewHeader";
import { 
  ReviewQuestion, 
  ReviewComplete, 
  GuestPrompt, 
  NoReviewItems,
  ReviewError
} from "@/components/review";

const Index = () => {
  const navigate = useNavigate();
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
        
        console.log("Generating review session for user:", user.id);
        const session = await learningAlgorithmService.generateReviewSession(user.id);
        console.log("Session generated:", session);
        setReviewSession(session);
        
        if (!session || session.items.length === 0) {
          toast.info("No review items available", {
            description: "Complete more lessons to add vocabulary to your review queue."
          });
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
      setReviewStats({
        correct: reviewStats.correct + (correct ? 1 : 0),
        incorrect: reviewStats.incorrect + (correct ? 0 : 1)
      });
      
      if (currentItemIndex < reviewSession.items.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
      } else {
        setReviewComplete(true);
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
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading review items...</p>
          </div>
        </div>
      );
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

    if (reviewSession?.items.length === 0) {
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
            onRetryReview={handleRetryReview}
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

export default Index;
