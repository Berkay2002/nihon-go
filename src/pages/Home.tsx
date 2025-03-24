
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Zap, BookOpen, Trophy, ArrowRight, CheckCircle2, LockIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/services/userProgressService";
import contentService from "@/services/contentService";

const Home = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isGuest, profile } = useAuth();
  const { getUserStreakData, getUserProgressData } = useUserProgress();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(50);
  const [recentLessons, setRecentLessons] = useState<any[]>([]);
  const [nextLesson, setNextLesson] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading) return;
      
      try {
        setLoading(true);
        
        if (user) {
          // Get user streak data
          const streakData = await getUserStreakData();
          if (streakData) {
            setStreak(streakData.current_streak);
            setLevel(streakData.level);
            setXp(streakData.daily_xp);
            setTotalXp(streakData.total_xp);
            setDailyGoal(streakData.daily_goal);
          }
          
          // Get user progress data
          const progressData = await getUserProgressData();
          
          // Get units and lessons
          const units = await contentService.getUnits();
          const unlockedUnits = units.filter(unit => !unit.is_locked);
          
          // Find completed and in-progress lessons
          const completedLessonIds = progressData
            ? progressData.filter(p => p.is_completed).map(p => p.lesson_id)
            : [];
          
          const inProgressLessonIds = progressData
            ? progressData.filter(p => !p.is_completed).map(p => p.lesson_id)
            : [];
          
          // Get lessons from the first unit for new users
          if ((!progressData || progressData.length === 0) && unlockedUnits.length > 0) {
            const firstUnitLessons = await contentService.getLessonsByUnit(unlockedUnits[0].id);
            if (firstUnitLessons.length > 0) {
              setNextLesson({
                id: firstUnitLessons[0].id,
                title: firstUnitLessons[0].title,
                unitName: unlockedUnits[0].name,
                xp_reward: firstUnitLessons[0].xp_reward
              });
            }
          } else {
            // Find the first incomplete lesson from all units
            for (const unit of unlockedUnits) {
              const unitLessons = await contentService.getLessonsByUnit(unit.id);
              const sortedLessons = unitLessons.sort((a, b) => a.order_index - b.order_index);
              
              for (const lesson of sortedLessons) {
                if (!completedLessonIds.includes(lesson.id)) {
                  setNextLesson({
                    id: lesson.id,
                    title: lesson.title,
                    unitName: unit.name,
                    xp_reward: lesson.xp_reward
                  });
                  break;
                }
              }
              
              if (nextLesson) break;
            }
          }
          
          // Get recent lessons
          const recentLessonsList = [];
          
          if (progressData && progressData.length > 0) {
            // Sort by last attempted date
            const sortedProgress = [...progressData].sort(
              (a, b) => new Date(b.last_attempted_at).getTime() - new Date(a.last_attempted_at).getTime()
            );
            
            // Get the top 3 recent lessons
            for (let i = 0; i < Math.min(3, sortedProgress.length); i++) {
              const progress = sortedProgress[i];
              try {
                const lesson = await contentService.getLesson(progress.lesson_id);
                const unit = units.find(u => u.id === lesson.unit_id);
                
                recentLessonsList.push({
                  id: lesson.id,
                  title: lesson.title,
                  unitName: unit ? unit.name : "Unknown Unit",
                  isCompleted: progress.is_completed,
                  accuracy: progress.accuracy,
                  xpEarned: progress.xp_earned
                });
              } catch (error) {
                console.error("Error fetching lesson details:", error);
              }
            }
          }
          
          setRecentLessons(recentLessonsList);
        } else if (isGuest) {
          // Demo content for guest users
          setStreak(1);
          setLevel(1);
          setXp(15);
          setTotalXp(15);
          setDailyGoal(50);
          
          // Get first unit and first lesson for demo
          try {
            const units = await contentService.getUnits();
            const firstUnit = units.find(unit => !unit.is_locked);
            
            if (firstUnit) {
              const lessons = await contentService.getLessonsByUnit(firstUnit.id);
              
              if (lessons.length > 0) {
                setNextLesson({
                  id: lessons[0].id,
                  title: lessons[0].title,
                  unitName: firstUnit.name,
                  xp_reward: lessons[0].xp_reward
                });
                
                // Add a mock "recent lesson" for demo purposes
                setRecentLessons([
                  {
                    id: lessons[0].id,
                    title: "Introduction to Hiragana",
                    unitName: "Basics",
                    isCompleted: false,
                    accuracy: 0,
                    xpEarned: 0
                  }
                ]);
              }
            }
          } catch (error) {
            console.error("Error fetching demo content:", error);
            // Fallback demo content if data can't be fetched
            setNextLesson({
              id: "demo-lesson",
              title: "Introduction to Japanese",
              unitName: "Basics",
              xp_reward: 10
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, authLoading, getUserStreakData, getUserProgressData, isGuest]);

  // Render different content for guest users
  const renderGuestMessage = () => {
    if (!isGuest) return null;
    
    return (
      <Card className="border border-nihongo-blue/20 bg-nihongo-blue/5 mb-8">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="shrink-0 mt-1">
              <LockIcon className="h-5 w-5 text-nihongo-blue" />
            </div>
            <div>
              <h3 className="font-medium text-nihongo-blue">Demo Mode</h3>
              <p className="text-sm text-muted-foreground">
                You're currently exploring in demo mode. Progress will not be saved. 
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-nihongo-red"
                  onClick={() => navigate('/auth?tab=signup')}
                >
                  Sign up
                </Button>{' '}
                to track your progress and unlock all features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">
          {isGuest ? 
            `こんにちは, Guest!` : 
            `こんにちは, ${profile?.username || user?.user_metadata?.username || "Friend"}!`}
        </h1>
        <p className="text-muted-foreground">Welcome to your Japanese learning journey</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nihongo-red"></div>
        </div>
      ) : (
        <>
          {renderGuestMessage()}
          
          <section className="mb-8">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card className="border border-nihongo-red/10">
                <CardContent className="flex flex-col items-center justify-center p-4 h-full">
                  <div className="flex items-center justify-center w-12 h-12 bg-nihongo-red/10 rounded-full mb-2">
                    <Flame className="w-6 h-6 text-nihongo-red" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Streak</p>
                  <p className="text-2xl font-bold">{streak}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </CardContent>
              </Card>
              
              <Card className="border border-nihongo-blue/10">
                <CardContent className="flex flex-col items-center justify-center p-4 h-full">
                  <div className="flex items-center justify-center w-12 h-12 bg-nihongo-blue/10 rounded-full mb-2">
                    <Zap className="w-6 h-6 text-nihongo-blue" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Level</p>
                  <p className="text-2xl font-bold">{level}</p>
                  <p className="text-xs text-muted-foreground">{totalXp} XP total</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border border-nihongo-gold/10 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-nihongo-gold/10 rounded-full mr-3">
                      <Trophy className="w-5 h-5 text-nihongo-gold" />
                    </div>
                    <div>
                      <p className="font-semibold">Daily Goal</p>
                      <p className="text-xs text-muted-foreground">{xp}/{dailyGoal} XP today</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {Math.min(Math.round((xp / dailyGoal) * 100), 100)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min((xp / dailyGoal) * 100, 100)} 
                  className="h-2 bg-gray-100" 
                  indicatorClassName="bg-nihongo-gold" 
                />
              </CardContent>
            </Card>
          </section>

          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Continue Learning</h2>
            </div>
            
            {nextLesson ? (
              <Card className="border hover:shadow-md transition-all cursor-pointer mb-4"
                onClick={() => navigate(`/app/lesson/${nextLesson.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-nihongo-red/10 flex items-center justify-center mr-3">
                        <BookOpen className="w-6 h-6 text-nihongo-red" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{nextLesson.title}</h3>
                        <p className="text-xs text-muted-foreground">{nextLesson.unitName}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center bg-nihongo-red/10 px-2 py-1 rounded-full mb-2">
                        <Zap className="w-3 h-3 text-nihongo-red mr-1" />
                        <span className="text-xs font-medium text-nihongo-red">{nextLesson.xp_reward} XP</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border mb-4">
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground">All lessons completed!</p>
                  <Button 
                    className="mt-2" 
                    variant="outline" 
                    onClick={() => navigate('/app/units')}>
                    Browse All Units
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <Button 
              variant="outline" 
              className="w-full border-nihongo-blue/30 hover:bg-nihongo-blue/5 text-nihongo-blue"
              onClick={() => navigate('/app/units')}
            >
              View All Lessons
            </Button>
          </section>
          
          {recentLessons.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Lessons</h2>
              </div>
              
              <div className="space-y-3">
                {recentLessons.map((lesson, index) => (
                  <Card 
                    key={index}
                    className={`border transition-all cursor-pointer ${
                      lesson.isCompleted ? 'border-nihongo-green/30' : 'border-gray-200'
                    }`}
                    onClick={() => navigate(`/app/lesson/${lesson.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex flex-col">
                            <h3 className="font-semibold text-sm">{lesson.title}</h3>
                            <p className="text-xs text-muted-foreground">{lesson.unitName}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {lesson.isCompleted && (
                            <div className="flex items-center bg-nihongo-green/10 px-2 py-1 rounded-full mr-2">
                              <CheckCircle2 className="w-3 h-3 text-nihongo-green mr-1" />
                              <span className="text-xs font-medium text-nihongo-green">
                                {lesson.accuracy}%
                              </span>
                            </div>
                          )}
                          {isGuest && (
                            <div className="mr-2">
                              <LockIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {isGuest && (
            <section className="mt-8">
              <Card className="border-nihongo-red/20 bg-nihongo-red/5">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-center mb-3">Ready to track your progress?</h3>
                  <Button 
                    className="w-full bg-nihongo-red hover:bg-nihongo-red/90"
                    onClick={() => navigate('/auth?tab=signup')}
                  >
                    Create Free Account
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
