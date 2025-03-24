
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import contentService, { Lesson as LessonType, Vocabulary } from "@/services/contentService";
import { useAuth } from "@/hooks/useAuth";
import { 
  LessonHeader, 
  LessonOverview, 
  VocabularySection,
  LessonActions,
  DemoMessage
} from "@/components/lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const Lesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isGuest } = useAuth();

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Loading took too long. Please try again.");
        toast.error("Failed to load lesson data", {
          description: "Please refresh the page or try again later."
        });
      }
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use Promise.race to add timeout safeguards
        const lessonDataPromise = Promise.race([
          contentService.getLesson(lessonId),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("Lesson fetch timeout")), 5000)
          )
        ]);
        
        const vocabularyPromise = Promise.race([
          contentService.getVocabularyByLesson(lessonId),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("Vocabulary fetch timeout")), 5000)
          )
        ]);
        
        // Fetch lesson details
        const lessonData = await lessonDataPromise;
        setLesson(lessonData);
        
        // Fetch vocabulary for this lesson
        const vocabData = await vocabularyPromise;
        
        // If in guest mode, limit vocabulary items
        if (isGuest) {
          setVocabulary(vocabData.slice(0, 3)); // Only show first 3 vocabulary items in demo mode
        } else {
          setVocabulary(vocabData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lesson:", error);
        setError("Failed to load lesson data. Please try refreshing the page.");
        toast.error("Failed to load lesson data");
        setLoading(false);
        
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    };
    
    fetchLessonData();
  }, [lessonId, isGuest]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nihongo-red"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6">
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
      <div className="container max-w-md mx-auto px-4 pt-6">
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
      <DemoMessage isGuest={isGuest} />
      <LessonOverview lesson={lesson} />
      <VocabularySection vocabulary={vocabulary} isGuest={isGuest} />
      <LessonActions lessonId={lessonId || ""} isGuest={isGuest} />
    </div>
  );
};

export default Lesson;
