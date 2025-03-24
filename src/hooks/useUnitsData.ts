
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import contentService from "@/services/contentService";
import type { Unit, Lesson } from "@/services/contentService";
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
  const { user } = useAuth();
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
      
      // Use Promise.race to add timeout for data fetch
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
      
      const unitsWithProgress = unitsData.map((unit) => {
        let progress = 0;
        
        if (user && progressData) {
          // Calculate actual progress based on completed lessons for this unit
          // First get all lessons for this unit
          contentService.getLessonsByUnit(unit.id)
            .then(unitLessons => {
              if (unitLessons.length > 0) {
                // Get completed lessons for this unit
                const lessonIds = unitLessons.map(lesson => lesson.id);
                const completedLessons = progressData.filter(
                  p => lessonIds.includes(p.lesson_id) && p.is_completed
                );
                
                // Calculate percentage
                if (lessonIds.length > 0) {
                  progress = Math.floor((completedLessons.length / lessonIds.length) * 100);
                }
              }
            })
            .catch(err => {
              console.error("Error getting lessons for progress calculation:", err);
            });
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
        let isLocked = index > 0; // Only first lesson is unlocked by default
        
        if (user && progressData) {
          // Get completion status from user progress data
          const lessonProgress = progressData.find(p => p.lesson_id === lesson.id);
          isCompleted = lessonProgress?.is_completed || false;
          
          // Unlock the next lesson if the previous one is completed
          if (index > 0) {
            const previousLesson = lessonsData[index - 1];
            const previousLessonProgress = progressData.find(
              p => p.lesson_id === previousLesson.id
            );
            isLocked = !(previousLessonProgress?.is_completed || false);
          } else {
            isLocked = false; // First lesson is always unlocked
          }
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
  }, [unitId, user, getUserProgressData]);
  
  useEffect(() => {
    fetchLessons();
  }, [selectedUnit, user, getUserProgressData]);

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
    handleRefresh,
    fetchUnits,
    fetchLessons
  };
};
