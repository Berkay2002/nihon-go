// src/pages/LessonPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import contentService, { Lesson } from "@/services/contentService";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/services/userProgressService";
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { getUserProgressData } = useUserProgress();

  // Fetch lesson data
  useEffect(() => {
    if (!lessonId) {
      setError("No lesson ID provided");
      setLoading(false);
      return;
    }

    const fetchLessonData = async () => {
      try {
        console.log(`Fetching lesson with ID: ${lessonId}`);
        setLoading(true);
        setError(null);

        const lessonData = await contentService.getLesson(lessonId);
        
        // Ensure is_locked is properly set before updating state
        if (lessonData) {
          const updatedLessonData = {
            ...lessonData,
            is_locked: lessonData.is_locked ?? false
          };
          
          console.log("Lesson data received:", updatedLessonData);
          setLesson(updatedLessonData);
          
          // Check if the lesson is already completed
          if (user) {
            try {
              const progressData = await getUserProgressData();
              const lessonProgress = progressData.find(p => p.lesson_id === lessonId);
              setIsCompleted(lessonProgress?.is_completed || false);
            } catch (progressError) {
              console.error("Error fetching progress data:", progressError);
              // Continue without progress data
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching lesson: ${error}`);
        setError("Failed to load lesson. Please try again later.");
        setLoading(false);
        toast.error("Could not load lesson", {
          description: "Please refresh or try again later."
        });
      }
    };

    fetchLessonData();
  }, [lessonId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-medium-contrast">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-nihongo-error mb-4" />
            <h1 className="text-2xl font-bold mb-4 text-center text-high-contrast">Lesson not found</h1>
            <p className="text-medium-contrast mb-6 text-center">
              {error || "The lesson you're looking for could not be found."}
            </p>
            <Button 
              onClick={() => navigate('/app')}
              className="bg-nihongo-blue hover:bg-nihongo-blue/90 text-white"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Now, let's see if we can render the actual lesson
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-high-contrast">{lesson.title}</h1>
        <p className="text-lg mb-6 text-medium-contrast">{lesson.description}</p>
        
        <div className="mb-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-medium-contrast mb-2">Estimated time:</p>
          <p className="font-medium text-high-contrast">{lesson.estimated_time}</p>
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-medium-contrast mb-1">XP Reward:</p>
            {isCompleted ? (
              <p className="font-medium text-low-contrast">0 XP (already completed)</p>
            ) : (
              <p className="font-medium text-nihongo-blue dark:text-blue-400">{lesson.xp_reward} XP</p>
            )}
          </div>
          <Button 
            onClick={() => navigate(`/app/exercise/${lesson.id}`)}
            className="bg-nihongo-green hover:bg-nihongo-green/90 text-white px-6 py-2"
          >
            {isCompleted ? 'Practice Again' : 'Start Exercises'}
          </Button>
        </div>
        
        <Button 
          onClick={() => navigate('/app')}
          variant="outline"
          className="mt-4 border-border text-medium-contrast hover:text-high-contrast"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default LessonPage;