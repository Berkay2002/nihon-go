
import React from "react";
import { toast } from "sonner";
import { StartLessonButton, GuestPromptButton } from "./buttons";

interface LessonActionsProps {
  lessonId: string;
  isGuest: boolean;
}

export const LessonActions: React.FC<LessonActionsProps> = ({ lessonId, isGuest }) => {
  const handleGuestStart = () => {
    if (isGuest) {
      toast.info("Demo lesson", {
        description: "In demo mode, lesson progress won't be saved. Sign up to track your progress."
      });
    }
  };

  return (
    <div className="space-y-4">
      <StartLessonButton 
        lessonId={lessonId} 
        isGuest={isGuest} 
        onStart={handleGuestStart} 
      />
      
      {isGuest && (
        <GuestPromptButton />
      )}
    </div>
  );
};
