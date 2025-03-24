
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, BookOpen, Zap } from "lucide-react";
import { toast } from "sonner";
import contentService, { Lesson as LessonType, Vocabulary } from "@/services/contentService";

const Lesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

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
        setVocabulary(vocabData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lesson:", error);
        toast.error("Failed to load lesson data");
        setLoading(false);
      }
    };
    
    fetchLessonData();
  }, [lessonId]);

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
          <Button onClick={() => navigate('/app/units')}>
            Return to Units
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <header className="mb-6">
        <Button variant="ghost" className="p-0 h-auto mb-4" onClick={() => navigate('/app/units')}>
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Back to Units</span>
        </Button>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="text-muted-foreground">{lesson.title}</p>
      </header>

      <section className="mb-8">
        <Card className="border border-nihongo-blue/10 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-nihongo-blue/10 flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-nihongo-blue" />
                </div>
                <div>
                  <h3 className="font-semibold">Overview</h3>
                  <p className="text-xs text-muted-foreground">{lesson.estimated_time} · Exercises</p>
                </div>
              </div>
              <div className="flex items-center bg-nihongo-red/10 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4 text-nihongo-red mr-1" />
                <span className="text-xs font-medium text-nihongo-red">{lesson.xp_reward} XP</span>
              </div>
            </div>
            <p className="text-sm mb-4">{lesson.description}</p>
          </CardContent>
        </Card>
      </section>

      {vocabulary.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Vocabulary</h2>
          <div className="space-y-3">
            {vocabulary.map((word) => (
              <Card key={word.id} className="border border-nihongo-red/10 hover:border-nihongo-red/30 transition-colors">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Japanese</p>
                      <p className="text-lg font-semibold font-japanese">{word.japanese}</p>
                      <p className="text-xs text-muted-foreground mt-1">{word.romaji}</p>
                    </div>
                    <div className="border-l pl-4">
                      <p className="text-xs text-muted-foreground mb-1">English</p>
                      <p className="text-lg font-semibold">{word.english}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Button 
        className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        onClick={() => navigate(`/app/exercise/${lessonId}`)}
      >
        Start Lesson
      </Button>
    </div>
  );
};

export default Lesson;
