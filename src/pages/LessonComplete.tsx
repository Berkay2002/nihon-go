import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Star } from 'lucide-react';
import { useUserProgress } from '@/services/userProgressService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function LessonComplete() {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { updateLessonProgress } = useUserProgress();
  const { user } = useAuth();
  
  // In a real app, we would fetch lesson data from an API
  // For now, we'll use mock data
  const xpEarned = 10;
  const streak = 1; // This would come from user state
  
  // Mark lesson as completed when this page loads
  useEffect(() => {
    const markLessonCompleted = async () => {
      if (lessonId && user) {
        try {
          // Mark the lesson as completed with 100% accuracy
          await updateLessonProgress(lessonId, true, 100, xpEarned);
          console.log(`Lesson ${lessonId} marked as completed`);
        } catch (error) {
          console.error('Error marking lesson as completed:', error);
          toast.error('Failed to update your progress');
        }
      }
    };
    
    markLessonCompleted();
  }, [lessonId, user, updateLessonProgress, xpEarned]);
  
  const handleContinue = () => {
    navigate('/app');
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-8">
          <Trophy size={80} className="text-yellow-400" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Great job!</h1>
        <p className="text-lg text-slate-300 mb-8">You've completed the lesson</p>
        
        <div className="bg-slate-800 rounded-xl p-6 flex flex-col items-center w-full max-w-md mb-8">
          <div className="flex justify-between w-full mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-500 p-2 rounded-full">
                <Star size={20} className="text-white" />
              </div>
              <span className="text-lg">XP earned</span>
            </div>
            <span className="text-xl font-bold text-yellow-400">+{xpEarned}</span>
          </div>
          
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-full">
                <span className="text-white font-bold">🔥</span>
              </div>
              <span className="text-lg">Streak</span>
            </div>
            <span className="text-xl font-bold text-orange-400">{streak} day</span>
          </div>
        </div>
        
        <button 
          onClick={handleContinue}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-xl transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
