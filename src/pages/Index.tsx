
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VocabularySection } from "@/components/lesson/VocabularySection";
import { useAuth } from "@/hooks/useAuth";
import learningAlgorithmService, { ReviewItem, ReviewSession } from "@/services/learningAlgorithmService";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Vocabulary } from "@/services/contentService";
import { AlertCircle, Check, Star, X } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);
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
        
        const session = await learningAlgorithmService.generateReviewSession(user.id);
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

  const handleRevealAnswer = () => {
    setRevealAnswer(true);
  };

  const handleResponse = async (correct: boolean, difficulty: number) => {
    if (!user || !reviewSession || currentItemIndex >= reviewSession.items.length) return;
    
    const currentItem = reviewSession.items[currentItemIndex];
    
    try {
      // Update the SRS data for this item
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
      
      // Move to next item or complete review
      if (currentItemIndex < reviewSession.items.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
        setRevealAnswer(false);
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
    setRevealAnswer(false);
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

  const renderCurrentItem = () => {
    if (!reviewSession || currentItemIndex >= reviewSession.items.length) {
      return <div>No items to review</div>;
    }
    
    const currentItem = reviewSession.items[currentItemIndex];
    const vocabItem: Vocabulary = currentItem.item;
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            {revealAnswer ? "Answer" : "Remember this word?"}
          </h3>
          
          {!revealAnswer ? (
            <div className="text-center">
              <p className="text-3xl font-semibold font-japanese mb-2">{vocabItem.japanese}</p>
              <p className="text-xl text-slate-600 dark:text-slate-300">{vocabItem.hiragana}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-3xl font-semibold font-japanese mb-1">{vocabItem.japanese}</p>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-1">{vocabItem.hiragana}</p>
                <p className="text-lg text-slate-500 dark:text-slate-400 italic">{vocabItem.romaji}</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-medium text-nihongo-red">
                  {vocabItem.english}
                </p>
              </div>
              
              {vocabItem.example_sentence && (
                <div className="text-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Example:</p>
                  <p className="text-md font-japanese">{vocabItem.example_sentence}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {!revealAnswer ? (
          <Button 
            className="w-full py-6" 
            onClick={handleRevealAnswer}
          >
            Reveal Answer
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="py-5 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => handleResponse(false, 4)}
            >
              <X className="mr-2 h-5 w-5" />
              Didn't Know
            </Button>
            <Button 
              className="py-5 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleResponse(true, 2)}
            >
              <Check className="mr-2 h-5 w-5" />
              Knew It
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center text-sm text-slate-500 px-1">
          <div>
            Item {currentItemIndex + 1} of {reviewSession.items.length}
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              <Check className="h-4 w-4 text-green-500 mr-1" />
              <span>{reviewStats.correct}</span>
            </div>
            <div className="flex items-center">
              <X className="h-4 w-4 text-red-500 mr-1" />
              <span>{reviewStats.incorrect}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewComplete = () => {
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
              onClick={handleRetryReview}
            >
              Review Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGuestPrompt = () => {
    return (
      <Card className="animate-fade-in">
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Star className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Spaced Repetition Review</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Sign in to track your vocabulary progress and review words at optimal intervals
            </p>
          </div>
          
          <div className="pt-4 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/app/units")}
            >
              Browse Lessons
            </Button>
            <Button 
              className="w-full" 
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading review items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="max-w-md w-full px-4">
          {renderGuestPrompt()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">Vocabulary Review</h1>
        
        {reviewSession?.items.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-medium mb-2">No Items to Review</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Complete more lessons to add vocabulary to your review queue.
              </p>
              <Button onClick={() => navigate("/app/units")}>
                Go to Lessons
              </Button>
            </CardContent>
          </Card>
        ) : reviewComplete ? (
          renderReviewComplete()
        ) : (
          renderCurrentItem()
        )}
      </div>
    </div>
  );
};

export default Index;
