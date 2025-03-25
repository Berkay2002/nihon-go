
import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReviewSession } from "@/services/learningAlgorithmService";

interface ReviewCompleteProps {
  reviewSession: ReviewSession | null;
  reviewStats: { correct: number; incorrect: number };
  onRetryReview: () => void;
}

export const ReviewComplete: React.FC<ReviewCompleteProps> = ({
  reviewSession,
  reviewStats,
  onRetryReview
}) => {
  const navigate = useNavigate();

  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Star className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Review Complete!</h2>
          <p className="text-slate-600 dark:text-slate-400">
            You've reviewed {reviewSession?.items.length} vocabulary items
          </p>
        </div>
        
        <div className="flex justify-center gap-4 pt-2">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{reviewStats.correct}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">{reviewStats.incorrect}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Incorrect</p>
          </div>
        </div>
        
        <div className="pt-4 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/app/units")}
          >
            Continue Learning
          </Button>
          <Button 
            className="w-full" 
            onClick={onRetryReview}
          >
            Review Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
