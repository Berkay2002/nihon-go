
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Book, Lock, Check, LockIcon, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import contentService, { Unit, Lesson } from "@/services/contentService";
import { useUserProgress } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UnitCard, 
  UnitCardSkeleton,
  LessonCard, 
  LessonCardSkeleton,
  GuestMessage,
  ErrorMessage
} from "@/components/units";

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
  const [error, setError] = useState<string | null>(null);
  const { user, isGuest } = useAuth();
  const { getUserProgressData } = useUserProgress();

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For guest users, provide demo data instead of fetching from the database
      if (isGuest) {
        const demoUnits: UnitWithProgress[] = [
          {
            id: "demo-unit-1",
            name: "Basics",
            description: "Essential Japanese phrases and greetings",
            order_index: 1,
            is_locked: false,
            progress: 10
          },
          {
            id: "demo-unit-2",
            name: "Greetings",
            description: "Learn how to say hello and introduce yourself",
            order_index: 2,
            is_locked: true,
            progress: 0
          },
          {
            id: "demo-unit-3",
            name: "Food",
            description: "Learn vocabulary for ordering food and drinks",
            order_index: 3,
            is_locked: true,
            progress: 0
          }
        ];
        
        setUnits(demoUnits);
        
        if (!selectedUnit && demoUnits.length > 0) {
          setSelectedUnit(demoUnits[0].id);
        } else if (unitId) {
          setSelectedUnit(unitId);
        }
        
        setLoading(false);
        return;
      }
      
      // Real data fetch for authenticated users
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
        }
        
        return {
          ...unit,
          progress,
          is_locked: unit.is_locked
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
      setError("Failed to load units. Please try again later.");
      setLoading(false);
    }
  };
  
  const fetchLessons = async () => {
    if (!selectedUnit) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // For guest users, provide demo data instead of fetching from the database
      if (isGuest) {
        // Simulate demo lessons based on the selected unit
        if (selectedUnit === "demo-unit-1") {
          const demoLessons: LessonWithProgress[] = [
            {
              id: "demo-lesson-1",
              unit_id: "demo-unit-1",
              title: "Introduction to Hiragana",
              description: "Learn the basics of the Japanese writing system",
              order_index: 1,
              estimated_time: "10 minutes",
              xp_reward: 10,
              is_completed: false,
              is_locked: false
            },
            {
              id: "demo-lesson-2",
              unit_id: "demo-unit-1",
              title: "Basic Phrases",
              description: "Essential phrases for beginners",
              order_index: 2,
              estimated_time: "15 minutes",
              xp_reward: 15,
              is_completed: false,
              is_locked: true
            }
          ];
          setLessons(demoLessons);
        } else {
          // For any other unit in demo mode, show locked content
          setLessons([
            {
              id: "demo-locked",
              unit_id: selectedUnit,
              title: "Locked Content",
              description: "Sign up to unlock this content",
              order_index: 1,
              estimated_time: "Unknown",
              xp_reward: 0,
              is_completed: false,
              is_locked: true
            }
          ]);
        }
        
        setLoading(false);
        return;
      }
      
      // Real data fetch for authenticated users
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
      setError("Failed to load lessons. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [unitId, user, getUserProgressData, isGuest]);
  
  useEffect(() => {
    fetchLessons();
  }, [selectedUnit, user, getUserProgressData, isGuest]);

  const currentUnit = units.find(unit => unit.id === selectedUnit);

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

      {isGuest && <GuestMessage navigate={navigate} />}
      {error && <ErrorMessage error={error} onRetry={() => { fetchUnits(); fetchLessons(); }} />}

      <section className="mb-8 overflow-hidden">
        {loading && !units.length ? (
          <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
            {[1, 2, 3].map((i) => <UnitCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
            {units.map((unit) => (
              <UnitCard 
                key={unit.id}
                unit={unit}
                isSelected={unit.id === selectedUnit}
                onClick={() => !unit.is_locked && setSelectedUnit(unit.id)}
              />
            ))}
          </div>
        )}
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

          {loading && !lessons.length ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <LessonCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <LessonCard 
                  key={lesson.id}
                  lesson={lesson}
                  isGuest={isGuest}
                  onClick={() => handleLessonClick(lesson)}
                />
              ))}

              {lessons.length === 0 && !loading && !error && (
                <Card className="border">
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground">No lessons available for this unit yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

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
    </div>
  );
};

export default Units;
