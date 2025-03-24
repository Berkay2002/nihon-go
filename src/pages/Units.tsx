
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Book, Lock, Check } from "lucide-react";
import { useToast } from "sonner";
import contentService, { Unit, Lesson } from "@/services/contentService";
import userProgressService, { useUserProgress } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";

const Units = () => {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const [selectedUnit, setSelectedUnit] = useState<string>(unitId || "");
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { getUserProgressData } = useUserProgress();
  const toast = useToast();

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        // Get all units
        const unitsData = await contentService.getUnits();
        
        // Get user progress if logged in
        let progressData = null;
        if (user) {
          progressData = await getUserProgressData();
        }
        
        // Calculate progress for each unit if user is logged in
        const unitsWithProgress = unitsData.map(unit => {
          let progress = 0;
          
          if (progressData) {
            // Here we would need to get lessons for each unit and calculate progress
            // For now we'll set a placeholder
            progress = Math.floor(Math.random() * 100); // placeholder
          }
          
          return {
            ...unit,
            progress
          };
        });
        
        setUnits(unitsWithProgress);
        
        // Select first unit if none selected
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
  }, [unitId, user, getUserProgressData, toast, selectedUnit]);
  
  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedUnit) return;
      
      try {
        setLoading(true);
        // Get lessons for selected unit
        const lessonsData = await contentService.getLessonsByUnit(selectedUnit);
        
        // Get user progress if logged in
        let progressData = null;
        if (user) {
          progressData = await getUserProgressData();
        }
        
        // Mark lessons as completed based on user progress
        const lessonsWithProgress = lessonsData.map(lesson => {
          let isCompleted = false;
          
          if (progressData) {
            const lessonProgress = progressData.find(p => p.lesson_id === lesson.id);
            isCompleted = lessonProgress?.is_completed || false;
          }
          
          return {
            ...lesson,
            is_completed: isCompleted
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
  }, [selectedUnit, user, getUserProgressData, toast]);

  const currentUnit = units.find(unit => unit.id === selectedUnit);

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
                {currentUnit.progress !== undefined && (
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
                    className={`border hover:shadow-md transition-all cursor-pointer ${
                      lesson.is_completed ? 'border-nihongo-green/30' : 'border-gray-200'
                    }`}
                    onClick={() => navigate(`/app/lesson/${lesson.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full ${
                            lesson.is_completed ? 'bg-nihongo-green/10' : 'bg-nihongo-red/10'
                          } flex items-center justify-center mr-3`}>
                            {lesson.is_completed ? (
                              <Check className="w-5 h-5 text-nihongo-green" />
                            ) : (
                              <Book className="w-5 h-5 text-nihongo-red" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{lesson.title}</h3>
                            <p className="text-xs text-muted-foreground">Earn {lesson.xp_reward} XP</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Units;
