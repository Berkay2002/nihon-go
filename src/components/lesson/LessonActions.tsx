import React from "react";
import { StartLessonButton } from "./buttons";

interface LessonActionsProps {
  lessonId: string;
}

export const LessonActions: React.FC<LessonActionsProps> = ({ lessonId }) => {
  return (
    <div className="space-y-4">
      <StartLessonButton 
        lessonId={lessonId} 
      />
    </div>
  );
};
