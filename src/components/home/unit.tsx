import React from "react";
import { UnitBanner } from "./unit-banner";
import { LessonButton } from "./lesson-button";
import { useTheme } from "@/lib/theme-provider";
import { useNavigate } from 'react-router-dom';

type UnitProps = {
  id: string;
  title: string;
  description?: string;
  unitColor?: string;
  lessons: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    isCurrent: boolean;
    isLocked: boolean;
    type?: "standard" | "review" | "boss" | "treasure";
  }>;
  activeLesson?: {
    id: string;
  };
  activeLessonPercentage?: number;
  onContinue?: () => void;
  onSelectLesson: (lessonId: string) => void;
  index?: number;
};

export const Unit: React.FC<UnitProps> = ({
  id,
  title,
  description,
  unitColor,
  lessons,
  activeLesson,
  activeLessonPercentage = 0,
  onContinue,
  onSelectLesson,
  index = 0,
}) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const isFirstUnit = index === 0;

  const handleLessonClick = (lessonId: string) => {
    navigate(`/app/lesson/${lessonId}`);
  };

  return (
    <div className={`mb-12 ${isFirstUnit ? 'mt-8' : ''}`}>
      <UnitBanner 
        title={title} 
        description={description} 
        unitColor={unitColor}
        onContinue={onContinue}
      />

      <div className="relative flex flex-col items-center py-8">
        {/* No path track divs here */}
        
        {lessons.map((lesson, i) => {
          const isCurrent = lesson.id === activeLesson?.id || lesson.isCurrent;
          const isLocked = lesson.isLocked;

          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={i}
              totalCount={lessons.length - 1}
              current={isCurrent}
              locked={isLocked}
              percentage={activeLessonPercentage}
              onClick={() => handleLessonClick(lesson.id)}
              type={lesson.type}
            />
          );
        })}
      </div>
    </div>
  );
}; 