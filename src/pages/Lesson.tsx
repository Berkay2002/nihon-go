
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

const Lesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const { isGuest } = useAuth();

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) return;
      
      try {
        setLoading(true);
        
        // Fetch lesson details
        const lessonData = await contentService.getLesson(lessonId);
        setLesson(lessonData);
        
        // Fetch vocabulary for this lesson
        const vocabData = await contentService.getVocabularyByLesson(lessonId);
        
        // If in guest mode, limit vocabulary items
        if (isGuest) {
          setVocabulary(vocabData.slice(0, 3)); // Only show first 3 vocabulary items in demo mode
        } else {
          setVocabulary(vocabData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lesson:", error);
        toast.error("Failed to load lesson data");
        setLoading(false);
      }
    };
    
    fetchLessonData();
  }, [lessonId, isGuest]);

  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nihongo-red"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <button onClick={() => navigate('/app/units')}>
            Return to Units
          </button>
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
