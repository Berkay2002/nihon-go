
import { useState, useEffect } from "react";
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
  const { user } = useAuth();
  const { getUserProgressData } = useUserProgress();

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const unitsData = await contentService.getUnits();
      
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
      
      const lessonsData = await contentService.getLessonsByUnit(selectedUnit);
      
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
      setLoading(false);
      
      // Add fallback lesson in case of error
      if (lessons.length === 0) {
        setLessons([{
          id: "fallback-lesson",
          unit_id: selectedUnit,
          title: "Basic Lesson",
          description: "Begin your Japanese learning journey",
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

  return {
    selectedUnit,
    setSelectedUnit,
    units,
    lessons,
    loading,
    error,
    currentUnit: units.find(unit => unit.id === selectedUnit),
    fetchUnits,
    fetchLessons
  };
};
