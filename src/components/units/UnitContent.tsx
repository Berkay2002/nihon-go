
import React from "react";
import { NavigateFunction } from "react-router-dom";
import { UnitInfo } from "./UnitInfo";
import { LessonsList } from "./LessonsList";
import { UnitWithProgress, LessonWithProgress } from "@/hooks/useUnitsData";

interface UnitContentProps {
  currentUnit: UnitWithProgress | undefined;
  lessons: LessonWithProgress[];
  loading: boolean;
  error: string | null;
  navigate: NavigateFunction;
}

export const UnitContent: React.FC<UnitContentProps> = ({
  currentUnit,
  lessons,
  loading,
  error,
  navigate
}) => {
  if (!currentUnit) return null;

  const handleLessonClick = (lesson: LessonWithProgress) => {
    if (lesson.is_locked) {
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
        navigate={navigate}
        handleLessonClick={handleLessonClick}
      />
    </section>
  );
};
