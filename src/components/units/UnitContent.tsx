
import React from "react";
import { NavigateFunction } from "react-router-dom";
import { UnitInfo } from "./UnitInfo";
import { LessonsList } from "./LessonsList";
import { UnitWithProgress, LessonWithProgress } from "@/hooks/useUnitsData";
import { toast } from "@/components/ui/use-toast";

interface UnitContentProps {
  currentUnit: UnitWithProgress | undefined;
  lessons: LessonWithProgress[];
  loading: boolean;
  error: string | null;
  isGuest: boolean;
  navigate: NavigateFunction;
}

export const UnitContent: React.FC<UnitContentProps> = ({
  currentUnit,
  lessons,
  loading,
  error,
  isGuest,
  navigate
}) => {
  if (!currentUnit) return null;

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
  );
};
