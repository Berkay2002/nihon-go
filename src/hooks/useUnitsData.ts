
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import contentService, { Unit, Lesson } from "@/services/contentService";
import { useUserProgress } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";

// Extend the Unit and Lesson types with UI-specific properties
export interface UnitWithProgress extends Unit {
  progress?: number;
}

export interface LessonWithProgress extends Lesson {
  is_completed?: boolean;
  is_locked?: boolean;
}

export const useUnitsData = (unitId?: string) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(unitId || "");
  const [units, setUnits] = useState<UnitWithProgress[]>([]);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const { user, isGuest } = useAuth();
  const { getUserProgressData } = useUserProgress();

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
        setLoading(false);
        setError("Loading is taking longer than expected. Please refresh the page.");
        toast.error("Connection issue detected", {
          description: "Could not retrieve lesson data. Please refresh the page.",
        });
      }
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingTimeout(false);
      
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
      
      // Use Promise.race to add timeout for real data fetch
      const unitsDataPromise = Promise.race([
        contentService.getUnits(),
        new Promise<Unit[]>((_, reject) => 
          setTimeout(() => reject(new Error("Units fetch timeout")), 5000)
        )
      ]);
      
      const unitsData = await unitsDataPromise;
      
      let progressData = null;
      if (user) {
        try {
          progressData = await getUserProgressData();
        } catch (progressError) {
          console.error("Error fetching progress data:", progressError);
          // Continue without progress data
        }
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
      
      // Add fallback data in case of error to prevent empty UI
      if (units.length === 0) {
        setUnits([
          {
            id: "fallback-unit-1",
            name: "Basics",
            description: "Essential Japanese phrases and greetings",
            order_index: 1,
            is_locked: false,
            progress: 0
          }
        ]);
        setSelectedUnit("fallback-unit-1");
      }
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
      
      // Use Promise.race to add timeout for real data fetch
      const lessonsDataPromise = Promise.race([
        contentService.getLessonsByUnit(selectedUnit),
        new Promise<Lesson[]>((_, reject) => 
          setTimeout(() => reject(new Error("Lessons fetch timeout")), 5000)
        )
      ]);
      
      const lessonsData = await lessonsDataPromise;
      
      let progressData = null;
      if (user) {
        try {
          progressData = await getUserProgressData();
        } catch (progressError) {
          console.error("Error fetching progress data:", progressError);
          // Continue without progress data
        }
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
      
      // Add fallback lesson in case of error
      if (lessons.length === 0) {
        setLessons([{
          id: "fallback-lesson",
          unit_id: selectedUnit,
          title: "Basic Lesson",
          description: "Sorry, we couldn't load the full lesson content.",
          order_index: 1,
          estimated_time: "10 minutes",
          xp_reward: 10,
          is_completed: false,
          is_locked: false
        }]);
      }
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [unitId, user, getUserProgressData, isGuest]);
  
  useEffect(() => {
    fetchLessons();
  }, [selectedUnit, user, getUserProgressData, isGuest]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return {
    selectedUnit,
    setSelectedUnit,
    units,
    lessons,
    loading,
    error,
    loadingTimeout,
    currentUnit: units.find(unit => unit.id === selectedUnit),
    isGuest,
    handleRefresh,
    fetchUnits,
    fetchLessons
  };
};
