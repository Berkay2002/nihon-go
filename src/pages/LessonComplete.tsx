
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Zap, Flame, BookOpen, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";

const LessonComplete = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [animationComplete, setAnimationComplete] = useState(false);

  // Mock data - would come from API in real app
  const lessonResults = {
    lessonName: "Introduction",
    unitName: "Basics",
    xpEarned: 15,
    wordsLearned: 4,
    accuracy: 85,
    streakExtended: true,
    streakDays: 5,
    leveledUp: false,
    nextLesson: {
      id: "2",
      name: "Basic Phrases",
    },
  };

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
          <Button 
            className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => navigate(`/app/lesson/${lessonResults.nextLesson.id}`)}
          >
            Continue to {lessonResults.nextLesson.name}
          </Button>
          
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
