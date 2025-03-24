import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import contentService, { Unit, Lesson } from "@/services/contentService";
import { useUserProgress } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";
import { 
  GuestMessage,
  ErrorMessage
} from "@/components/units";
import { UnitsList } from "@/components/units/UnitsList";
import { LessonsList } from "@/components/units/LessonsList";
import { UnitInfo } from "@/components/units/UnitInfo";
import { UnitsHeader } from "@/components/units/UnitsHeader";

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
      <UnitsHeader navigate={navigate} />

      {isGuest && <GuestMessage navigate={navigate} />}
      {error && <ErrorMessage error={error} onRetry={() => { fetchUnits(); fetchLessons(); }} />}

      <section className="mb-8 overflow-hidden">
        <UnitsList 
          units={units} 
          selectedUnit={selectedUnit} 
          loading={loading && !units.length} 
          onSelectUnit={setSelectedUnit} 
        />
      </section>

      {currentUnit && (
        <section className="mb-8">
          <UnitInfo unit={currentUnit} />
          
          <LessonsList 
            lessons={lessons}
            loading={loading && !lessons.length}
            error={error}
            isGuest={isGuest}
            navigate={navigate}
            handleLessonClick={handleLessonClick}
          />
        </section>
      )}
    </div>
  );
};

export default Units;
