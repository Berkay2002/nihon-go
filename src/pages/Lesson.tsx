
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import contentService, { Lesson as LessonType, Vocabulary } from "@/services/contentService";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/services/userProgressService";
import { 
  LessonHeader, 
  LessonOverview, 
  VocabularySection,
  LessonActions
} from "@/components/lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { TimeoutError } from "@/components/shared/TimeoutError";

const Lesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [longLoading, setLongLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();
  const { getUserProgressData } = useUserProgress();

  // Add a better timeout mechanism with two stages
  useEffect(() => {
    let shortTimeoutId: number | null = null;
    let longTimeoutId: number | null = null;

    if (loading && !error) {
      // First timeout - show "taking longer than expected" message after 4 seconds
      shortTimeoutId = window.setTimeout(() => {
        setLongLoading(true);
        toast.info("Loading is taking longer than expected", {
          description: "Please be patient or refresh the page if this continues."
        });
      }, 4000);
      
      // Second timeout - treat as an error after 12 seconds total
      longTimeoutId = window.setTimeout(() => {
        setLoading(false);
        setError("Loading took too long. Please try again.");
        toast.error("Failed to load lesson data", {
          description: "Please refresh the page or try again later."
        });
        
        // Provide fallback data to prevent empty UI
        if (!lesson) {
          setLesson({
            id: lessonId || "fallback-lesson",
            unit_id: "fallback-unit",
            title: "Lesson Content Unavailable",
            description: "We're having trouble loading the lesson content.",
            order_index: 1,
            estimated_time: "Unknown",
            xp_reward: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }, 12000);
    }
    
    return () => {
      if (shortTimeoutId) window.clearTimeout(shortTimeoutId);
      if (longTimeoutId) window.clearTimeout(longTimeoutId);
    };
  }, [loading, error, lesson, lessonId]);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) return;
      
      try {
        setLoading(true);
        setLongLoading(false);
        setError(null);
        
        // Define a safer timeout promise creation function
        const createTimeoutPromise = (ms: number, name: string) => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`${name} timeout after ${ms}ms`)), ms)
          );
        
        // Use Promise.allSettled to get partial data even if some requests fail
        const results = await Promise.allSettled([
          // Lesson data with timeout
          Promise.race([
            contentService.getLesson(lessonId),
            createTimeoutPromise(6000, "Lesson fetch")
          ]),
          
          // Vocabulary data with timeout
          Promise.race([
            contentService.getVocabularyByLesson(lessonId),
            createTimeoutPromise(6000, "Vocabulary fetch")
          ])
        ]);
        
        // Extract results safely with proper type checking
        const lessonResult = results[0];
        const vocabResult = results[1];
        
        const lessonData = lessonResult.status === 'fulfilled' 
          ? lessonResult.value as LessonType 
          : null;
          
        const vocabData = vocabResult.status === 'fulfilled' 
          ? vocabResult.value as Vocabulary[] 
          : [];
        
        // Handle missing lesson data
        if (!lessonData) {
          throw new Error("Could not load lesson data");
        }
        
        // Ensure is_locked is set
        const updatedLessonData = {
          ...lessonData,
          is_locked: lessonData.is_locked ?? false
        };
        
        setLesson(updatedLessonData);
        setVocabulary(vocabData);
        
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
      } catch (error) {
        console.error("Error fetching lesson:", error);
        setError("Failed to load lesson data. Please try refreshing the page.");
        
        // Provide fallback data to prevent completely empty UI
        if (!lesson) {
          setLesson({
            id: lessonId || "fallback-lesson",
            unit_id: "fallback-unit",
            title: "Lesson Content Unavailable",
            description: "We're having trouble loading the lesson content.",
            order_index: 1,
            estimated_time: "Unknown",
            xp_reward: 10,
            is_locked: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } finally {
        // Ensure loading is always set to false, even on errors
        setLoading(false);
        setLongLoading(false);
      }
    };
    
    fetchLessonData();
  }, [lessonId, user]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Better loading state with multi-stage feedback
  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-center text-muted-foreground">
            {longLoading 
              ? "Still loading... This is taking longer than usual." 
              : "Loading lesson content..."}
          </p>
          
          {longLoading && (
            <div className="flex justify-center mt-4">
              <Button onClick={handleRefresh} size="sm" variant="outline">
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
        <Card className="border-red-200">
          <CardContent className="pt-6 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-4">
              <Button onClick={handleRefresh} className="bg-nihongo-blue hover:bg-nihongo-blue/90">
                Refresh
              </Button>
              <Button onClick={() => navigate('/app/units')} variant="outline">
                Return to Units
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <Button onClick={() => navigate('/app/units')} className="bg-nihongo-blue hover:bg-nihongo-blue/90">
            Return to Units
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <LessonHeader lesson={lesson} />
      <LessonOverview lesson={lesson} isCompleted={isCompleted} />
      <VocabularySection vocabulary={vocabulary} />
      <LessonActions lessonId={lessonId || ""} isCompleted={isCompleted} />
    </div>
  );
};

export default Lesson;
