
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Zap, Flame, BookOpen, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import contentService, { Lesson } from "@/services/contentService";
import userProgressService, { useUserProgress, UserProgress } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";

interface LessonResult {
  lessonName: string;
  unitName: string;
  xpEarned: number;
  wordsLearned: number;
  accuracy: number;
  streakExtended: boolean;
  streakDays: number;
  leveledUp: boolean;
  nextLesson: {
    id: string;
    name: string;
  } | null;
}

const LessonComplete = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [lessonResults, setLessonResults] = useState<LessonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { getUserProgressData, getUserStreakData } = useUserProgress();

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF4D4D', '#2C5282', '#FFD700'],
    });

    // Animate XP count
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const fetchLessonResults = async () => {
      if (!lessonId) return;
      
      try {
        setLoading(true);
        
        // Get lesson details
        const lesson = await contentService.getLesson(lessonId);
        
        // Get vocabulary for this lesson to count words learned
        const vocabulary = await contentService.getVocabularyByLesson(lessonId);
        
        // Get unit info
        const units = await contentService.getUnits();
        const unit = units.find(u => u.id === lesson.unit_id);
        
        // Get user progress if user is logged in
        let progress: UserProgress | null = null;
        let streak = null;
        let nextLesson = null;
        
        if (user) {
          // Get user progress for this lesson
          const progressData = await userProgressService.getLessonProgress(user.id, lessonId);
          progress = progressData;
          
          // Get user streak
          streak = await getUserStreakData();
          
          // Try to find next lesson
          const unitLessons = await contentService.getLessonsByUnit(lesson.unit_id);
          const sortedLessons = unitLessons.sort((a, b) => a.order_index - b.order_index);
          const currentLessonIndex = sortedLessons.findIndex(l => l.id === lessonId);
          
          if (currentLessonIndex < sortedLessons.length - 1) {
            nextLesson = {
              id: sortedLessons[currentLessonIndex + 1].id,
              name: sortedLessons[currentLessonIndex + 1].title
            };
          } else {
            // If this was the last lesson in the unit, check if there's another unit
            const unitIndex = units.findIndex(u => u.id === lesson.unit_id);
            if (unitIndex < units.length - 1 && !units[unitIndex + 1].is_locked) {
              const nextUnitLessons = await contentService.getLessonsByUnit(units[unitIndex + 1].id);
              if (nextUnitLessons.length > 0) {
                nextLesson = {
                  id: nextUnitLessons[0].id,
                  name: nextUnitLessons[0].title
                };
              }
            }
          }
        }
        
        // Build results object
        const results: LessonResult = {
          lessonName: lesson.title,
          unitName: unit?.name || "Unknown Unit",
          xpEarned: progress?.xp_earned || lesson.xp_reward,
          wordsLearned: vocabulary.length,
          accuracy: progress?.accuracy || 85, // Default if not logged in
          streakExtended: streak?.current_streak > 0,
          streakDays: streak?.current_streak || 0,
          leveledUp: false, // We would calculate this based on XP thresholds
          nextLesson
        };
        
        setLessonResults(results);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lesson results:", error);
        // Fallback to mock data if there's an error
        setLessonResults({
          lessonName: "Lesson",
          unitName: "Unit",
          xpEarned: 15,
          wordsLearned: 4,
          accuracy: 85,
          streakExtended: false,
          streakDays: 0,
          leveledUp: false,
          nextLesson: null
        });
        setLoading(false);
      }
    };
    
    fetchLessonResults();
  }, [lessonId, user, getUserProgressData, getUserStreakData]);

  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-8 flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nihongo-red"></div>
      </div>
    );
  }

  if (!lessonResults) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson results not found</h1>
          <Button onClick={() => navigate('/app/units')}>
            Return to Units
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 pt-8 pb-20 animate-fade-in">
      <header className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-nihongo-gold/10 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-nihongo-gold animate-pulse-scale" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Lesson Complete!</h1>
        <p className="text-muted-foreground">{lessonResults.unitName}: {lessonResults.lessonName}</p>
      </header>

      <section className="mb-8">
        <Card className="border border-nihongo-red/10 shadow-md mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Summary</h2>
              <div className="flex items-center bg-nihongo-red/10 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4 text-nihongo-red mr-1" />
                <span className="text-sm font-medium text-nihongo-red">
                  {animationComplete ? `+${lessonResults.xpEarned} XP` : '+0 XP'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-nihongo-green mr-2" />
                  <span>Accuracy</span>
                </div>
                <span className="font-medium">{lessonResults.accuracy}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 text-nihongo-blue mr-2" />
                  <span>Words Learned</span>
                </div>
                <span className="font-medium">{lessonResults.wordsLearned}</span>
              </div>
              
              {lessonResults.streakExtended && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Flame className="w-5 h-5 text-nihongo-red mr-2" />
                    <span>Streak Extended</span>
                  </div>
                  <span className="font-medium">{lessonResults.streakDays} days</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {lessonResults.nextLesson ? (
            <Button 
              className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate(`/app/lesson/${lessonResults.nextLesson?.id}`)}
            >
              Continue to {lessonResults.nextLesson?.name}
            </Button>
          ) : (
            <Button 
              className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/app/units')}
            >
              Back to Units
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full border-nihongo-blue/30 hover:bg-nihongo-blue/5 text-nihongo-blue py-6"
            onClick={() => navigate('/app/units')}
          >
            Return to Units
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LessonComplete;
