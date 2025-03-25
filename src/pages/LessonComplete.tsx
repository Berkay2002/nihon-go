import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Star, RefreshCw, Check, Flame, X, Zap, BookOpen } from 'lucide-react';
import { useUserProgress } from '@/services/userProgressService';
import type { UserProgress, UserStreak, LessonScorecard } from '@/services/userProgressService';
import type { ExerciseType } from '@/services/userProgress/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { InstallPrompt } from '@/components/install-prompt';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define a simplified version of ExerciseResponse for use in this component
interface ExerciseResponse {
  id: string;
  user_id: string;
  lesson_id: string;
  exercise_id: string;
  exercise_type: string;
  question: string;
  correct_answer: string;
  user_answer: string;
  is_correct: boolean;
  created_at: string;
}

export default function LessonComplete() {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { updateLessonProgress, getUserProgressData, getUserStreakData, updateUserStreak, getLessonScorecard } = useUserProgress();
  const { user } = useAuth();
  const [isFirstCompletion, setIsFirstCompletion] = useState(true);
  const [lessonData, setLessonData] = useState<UserProgress | null>(null);
  const [streakData, setStreakData] = useState<UserStreak | null>(null);
  const [scorecard, setScorecard] = useState<LessonScorecard | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessed, setIsProcessed] = useState(false);
  const [newXpEarned, setNewXpEarned] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showScorecard, setShowScorecard] = useState(false);
  
  // Get performance feedback based on accuracy
  const getPerformanceFeedback = (acc: number) => {
    if (acc >= 100) return { text: "AMAZING", color: "text-green-500" };
    if (acc >= 90) return { text: "GREAT", color: "text-green-500" };
    if (acc >= 75) return { text: "GOOD", color: "text-yellow-500" };
    if (acc >= 60) return { text: "FAIR", color: "text-yellow-600" };
    return { text: "KEEP PRACTICING", color: "text-orange-500" };
  };
  
  const performance = getPerformanceFeedback(accuracy);
  
  // Use useCallback to prevent recreating this function on each render
  const processLessonCompletion = useCallback(async () => {
    if (!lessonId || !user || isProcessed) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get current streak data
      const currentStreak = await getUserStreakData();
      setStreakData(currentStreak);
      
      // Check if lesson was already completed
      const userProgress = await getUserProgressData();
      console.log("All user progress:", JSON.stringify(userProgress));
      const existingLesson = userProgress.find(p => p.lesson_id === lessonId);
      console.log("Found lesson data:", JSON.stringify(existingLesson));
      
      // Get lesson scorecard with exercise results
      const lessonScorecard = await getLessonScorecard(lessonId);
      setScorecard(lessonScorecard);
      setAccuracy(lessonScorecard.accuracy);
      
      if (existingLesson?.is_completed) {
        // Lesson was already completed previously
        setIsFirstCompletion(false);
        setLessonData(existingLesson);
        setNewXpEarned(0); // No new XP for already completed lessons
        console.log(`Lesson ${lessonId} was already completed previously. Total XP: ${existingLesson.xp_earned}`);
        setIsLoading(false);
        setIsProcessed(true);
        return;
      }
      
      // Calculate XP based on lesson complexity (in a real app, this would come from the lesson data)
      // For now, use a fixed value and calculate based on accuracy
      const baseXP = 10;
      const calculatedAccuracy = lessonScorecard.accuracy;
      
      // Award bonus XP for 100% accuracy
      const accuracyBonus = calculatedAccuracy === 100 ? 5 : 0;
      const totalXpEarned = baseXP + accuracyBonus;
      setNewXpEarned(totalXpEarned);
      
      // Mark the lesson as completed with calculated accuracy
      await updateLessonProgress(lessonId, true, calculatedAccuracy, totalXpEarned);
      console.log(`Lesson ${lessonId} marked as completed. XP earned: ${totalXpEarned}`);
      
      // Only update streak for first-time completion
      const updatedStreak = await updateUserStreak(totalXpEarned);
      setStreakData(updatedStreak || currentStreak);
      
      // Fetch updated data after marking as complete
      const updatedProgress = await getUserProgressData();
      const updatedLesson = updatedProgress.find(p => p.lesson_id === lessonId);
      setLessonData(updatedLesson || null);
      
      // Dispatch lesson completed event for the PWA install prompt
      const event = new Event('lessonCompleted');
      window.dispatchEvent(event);
      
      // Check if we should show the install prompt
      const shouldShowPrompt = localStorage.getItem('showInstallPrompt') === 'true';
      const isMobile = window.innerWidth < 768;
      
      if (shouldShowPrompt && isMobile) {
        // We delay the prompt to let the user see their accomplishment first
        setTimeout(() => {
          setShowInstallPrompt(true);
          
          // Clear the flag so we don't show it again immediately
          localStorage.removeItem('showInstallPrompt');
        }, 1500);
      }
      
      setIsProcessed(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      toast.error('Failed to update your progress');
      
      // Still show UI with fallback data
      setLessonData({
        id: 'fallback',
        user_id: user.id,
        lesson_id: lessonId || 'unknown',
        is_completed: true,
        accuracy: 100,
        xp_earned: 0,
        last_attempted_at: new Date().toISOString()
      });
      
      setNewXpEarned(0);
      setIsLoading(false);
      setIsProcessed(true);
    }
  }, [
    lessonId, 
    user, 
    updateLessonProgress, 
    getUserProgressData, 
    getUserStreakData, 
    updateUserStreak,
    getLessonScorecard,
    isProcessed
  ]);
  
  useEffect(() => {
    if (!isProcessed) {
      processLessonCompletion();
    }
  }, [processLessonCompletion, isProcessed]);
  
  const handleContinue = () => {
    setShowInstallPrompt(false);
    navigate('/app');
  };
  
  const handleReviewLesson = () => {
    setShowScorecard(true);
  };
  
  // Helper to get exercise icon component
  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'select':
        return <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>;
      case 'translate':
        return <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-[10px] text-white font-bold">あ</span>
        </div>;
      case 'listen':
        return <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
          </svg>
        </div>;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Animated characters and effects */}
        <div className="relative w-full max-w-md h-60 mb-6">
          {/* Firework effects */}
          <div className="absolute top-0 left-1/4 animate-pulse">
            <div className="text-yellow-500 text-4xl">✨</div>
          </div>
          <div className="absolute top-10 right-1/4 animate-pulse delay-300">
            <div className="text-purple-400 text-4xl">✨</div>
          </div>
          <div className="absolute bottom-20 left-1/3 animate-pulse delay-700">
            <div className="text-green-400 text-4xl">✨</div>
          </div>
          
          {/* Characters */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-16">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-3xl">🦉</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-1/2 transform translate-x-16">
            <div className="w-32 h-32 flex items-center justify-center">
              <span className="text-4xl">👨‍🎓</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-yellow-400">
          {isFirstCompletion ? "Practice Complete!" : "Practice Complete!"}
        </h1>
        
        <p className="text-lg text-slate-300 mb-8">
          {isFirstCompletion 
            ? "Great job on completing the lesson!" 
            : "You've reviewed this lesson again"}
        </p>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10">
          {/* XP card */}
          <div className="bg-yellow-900/40 border-2 border-yellow-500 rounded-xl p-4 flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-yellow-500 mb-2">TOTAL XP</p>
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold text-yellow-500">
                {isFirstCompletion ? newXpEarned : 0}
              </span>
            </div>
          </div>
          
          {/* Accuracy card */}
          <div className="bg-green-900/40 border-2 border-green-500 rounded-xl p-4 flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-green-500 mb-2">{performance.text}</p>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold text-green-500">{Math.round(accuracy)}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 w-full max-w-md">
          <button 
            onClick={handleReviewLesson} 
            className="flex-1 bg-transparent hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-xl border-2 border-slate-600 transition-colors"
          >
            REVIEW LESSON
          </button>
          
          <button 
            onClick={handleContinue}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-xl transition-colors"
          >
            CONTINUE
          </button>
        </div>
      </div>
      
      {/* Scorecard Dialog */}
      <Dialog open={showScorecard} onOpenChange={setShowScorecard}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogTitle className="text-center text-xl">Check out your scorecard!</DialogTitle>
          <p className="text-center text-slate-300 mb-4">
            {scorecard?.totalExercises 
              ? `You got ${scorecard.correctExercises} out of ${scorecard.totalExercises} exercises correct`
              : "Click the tiles below to reveal the solutions"}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {scorecard?.responses && scorecard.responses.length > 0 ? (
              scorecard.responses.map((exercise, index) => (
                <div 
                  key={index} 
                  className={`bg-slate-700 rounded-lg p-3 flex flex-col ${!exercise.is_correct ? 'border-l-4 border-red-500' : ''}`}
                >
                  <div className="flex justify-between mb-2 items-start">
                    <div className="flex items-center gap-2">
                      {getExerciseIcon(exercise.exercise_type)}
                      <div className="text-xs text-slate-300 font-medium">
                        {exercise.question}
                      </div>
                    </div>
                    <div className={`rounded-full p-1 ${exercise.is_correct ? 'bg-green-900/60' : 'bg-red-900/60'}`}>
                      {exercise.is_correct 
                        ? <Check className="h-3 w-3 text-green-500" />
                        : <X className="h-3 w-3 text-red-500" />
                      }
                    </div>
                  </div>
                  
                  {exercise.exercise_type === "translate" && (
                    <>
                      <div className="mt-2 mb-1">
                        <span className="text-xs text-slate-400">Correct answer:</span>
                        <div className="text-sm text-green-300">{exercise.correct_answer}</div>
                      </div>
                      {!exercise.is_correct && (
                        <div className="mt-1">
                          <span className="text-xs text-slate-400">Your answer:</span>
                          <div className="text-sm text-red-300">{exercise.user_answer || "No answer"}</div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {exercise.exercise_type === "listen" && (
                    <div className="mt-auto flex justify-center">
                      <div className="bg-blue-500 rounded-full p-2 w-8 h-8 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-slate-400 py-6">
                No exercise data available for this lesson
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setShowScorecard(false)}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-xl transition-colors"
            >
              CLOSE
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Show install prompt after achievements are displayed */}
      {showInstallPrompt && (
        <InstallPrompt 
          variant="achievement"
          context="lesson-complete"
          streakCount={streakData?.current_streak || 1}
          lessonCount={lessonData?.xp_earned ? Math.ceil(lessonData.xp_earned / 15) : 1}
        />
      )}
    </div>
  );
}