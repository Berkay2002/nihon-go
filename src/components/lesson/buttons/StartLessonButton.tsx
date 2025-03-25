
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StartLessonButtonProps {
  lessonId: string;
  isGuest: boolean;
  onStart?: () => void;
}

export const StartLessonButton: React.FC<StartLessonButtonProps> = ({ 
  lessonId, 
  isGuest,
  onStart 
}) => {
  const navigate = useNavigate();

  const handleStartLesson = () => {
    if (onStart) {
      onStart();
    }
    navigate(`/app/exercise/${lessonId}`);
  };

  return (
    <Button 
      className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      onClick={handleStartLesson}
    >
      Start Lesson
    </Button>
  );
};
