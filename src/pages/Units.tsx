
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Book, Lock, Check, LockIcon } from "lucide-react";
import { toast } from "sonner";
import contentService, { Unit, Lesson } from "@/services/contentService";
import { useUserProgress } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";

// Extend the Unit and Lesson types with UI-specific properties
interface UnitWithProgress extends Unit {
  progress?: number;
}

interface LessonWithProgress extends Lesson {
  is_completed?: boolean;
  is_locked?: boolean;
}

const Units = () => {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const [selectedUnit, setSelectedUnit] = useState<string>(unitId || "");
  const [units, setUnits] = useState<UnitWithProgress[]>([]);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isGuest } = useAuth();
  const { getUserProgressData } = useUserProgress();

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const unitsData = await contentService.getUnits();
        
        let progressData = null;
        if (user) {
          progressData = await getUserProgressData();
        }
        
        const unitsWithProgress = unitsData.map((unit, index) => {
          let progress = 0;
          
          if (user && progressData) {
            // Calculate real progress for authenticated users
            progress = Math.floor(Math.random() * 100);
          } else if (isGuest) {
            // Demo progress for guest users
            progress = index === 0 ? 10 : 0;
          }
          
          return {
            ...unit,
            progress,
            // Lock all units except first one for guest users
            is_locked: isGuest ? (index > 0 || unit.is_locked) : unit.is_locked
          };
        });
        
        setUnits(unitsWithProgress);
        
        if (!selectedUnit && unitsWithProgress.length > 0) {
          setSelectedUnit(unitsWithProgress[0].id);
        } else if (unitId) {
          setSelectedUnit(unitId);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching units:", error);
        toast.error("Failed to load units");
        setLoading(false);
      }
    };
    
    fetchUnits();
  }, [unitId, user, getUserProgressData, isGuest, selectedUnit]);
  
  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedUnit) return;
      
      try {
        setLoading(true);
        const lessonsData = await contentService.getLessonsByUnit(selectedUnit);
        
        let progressData = null;
        if (user) {
          progressData = await getUserProgressData();
        }
        
        const lessonsWithProgress = lessonsData.map((lesson, index) => {
          let isCompleted = false;
          let isLocked = false;
          
          if (user && progressData) {
            // Real completion status for authenticated users
            const lessonProgress = progressData.find(p => p.lesson_id === lesson.id);
            isCompleted = lessonProgress?.is_completed || false;
          } else if (isGuest) {
            // Demo completion status for guest users
            // Only the first lesson is unlocked in guest mode
            isLocked = index > 0;
          }
          
          return {
            ...lesson,
            is_completed: isCompleted,
            is_locked: isLocked
          };
        });
        
        setLessons(lessonsWithProgress);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        toast.error("Failed to load lessons");
        setLoading(false);
      }
    };
    
    fetchLessons();
  }, [selectedUnit, user, getUserProgressData, isGuest]);

  const currentUnit = units.find(unit => unit.id === selectedUnit);

  // Render different message for guest users
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
                In demo mode, only the first lesson is available. 
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-nihongo-red"
                  onClick={() => navigate('/auth?tab=signup')}
                >
                  Sign up
                </Button>{' '}
                to unlock all content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleLessonClick = (lesson: LessonWithProgress) => {
    if (isGuest && lesson.is_locked) {
      toast.error("Feature locked in demo mode", {
        description: "Create an account to unlock all lessons and track your progress."
      });
      return;
    }
    navigate(`/app/lesson/${lesson.id}`);
  };

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <header className="mb-6">
        <Button variant="ghost" className="p-0 h-auto mb-4" onClick={() => navigate('/app')}>
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Back to Home</span>
        </Button>
        <h1 className="text-2xl font-bold">Japanese Lessons</h1>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nihongo-red"></div>
        </div>
      ) : (
        <>
          {renderGuestMessage()}

          <section className="mb-8 overflow-hidden">
            <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
              {units.map((unit) => (
                <Card 
                  key={unit.id} 
                  className={`flex-shrink-0 w-36 h-36 snap-start cursor-pointer transition-all duration-300 transform ${
                    selectedUnit === unit.id ? 'scale-[1.02] border-nihongo-red shadow-md' : 'border-gray-200'
                  } ${unit.is_locked ? 'opacity-70' : ''}`}
                  onClick={() => !unit.is_locked && setSelectedUnit(unit.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center relative">
                    {unit.is_locked && (
                      <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center rounded-md">
                        <Lock className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-full ${
                      !unit.is_locked ? 'bg-nihongo-red/10' : 'bg-gray-200'
                    } flex items-center justify-center mb-2`}>
                      <Book className={`w-6 h-6 ${
                        !unit.is_locked ? 'text-nihongo-red' : 'text-gray-400'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-sm">{unit.name}</h3>
                    {unit.progress !== undefined && unit.progress > 0 && (
                      <Progress value={unit.progress} className="h-1 mt-2 w-full bg-gray-100" 
                        indicatorClassName="bg-nihongo-red" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {currentUnit && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{currentUnit.name}</h2>
                {currentUnit.progress !== undefined && currentUnit.progress > 0 && (
                  <div className="bg-nihongo-blue/10 px-3 py-1 rounded-full text-xs font-medium text-nihongo-blue">
                    {currentUnit.progress}% Complete
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mb-6">{currentUnit.description}</p>

              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <Card 
                    key={lesson.id} 
                    className={`border transition-all cursor-pointer ${
                      lesson.is_completed ? 'border-nihongo-green/30' : 
                      lesson.is_locked ? 'border-gray-200 opacity-70' : 'border-gray-200'
                    }`}
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full ${
                            lesson.is_completed ? 'bg-nihongo-green/10' : 
                            lesson.is_locked ? 'bg-gray-200' : 'bg-nihongo-red/10'
                          } flex items-center justify-center mr-3`}>
                            {lesson.is_completed ? (
                              <Check className="w-5 h-5 text-nihongo-green" />
                            ) : lesson.is_locked ? (
                              <Lock className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Book className="w-5 h-5 text-nihongo-red" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{lesson.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {lesson.is_locked && isGuest ? 
                                "Locked in demo mode" : 
                                `Earn ${lesson.xp_reward} XP`}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {isGuest && (
                <div className="mt-6">
                  <Button 
                    className="w-full bg-nihongo-red hover:bg-nihongo-red/90"
                    onClick={() => navigate('/auth?tab=signup')}
                  >
                    Sign Up to Unlock All Lessons
                  </Button>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Units;
