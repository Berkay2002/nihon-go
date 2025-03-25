
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LessonActionsProps {
  lessonId: string;
  isGuest: boolean;
}

export const LessonActions: React.FC<LessonActionsProps> = ({ lessonId, isGuest }) => {
  const navigate = useNavigate();

  const handleStartLesson = () => {
    if (isGuest) {
      toast.info("Demo lesson", {
        description: "In demo mode, lesson progress won't be saved. Sign up to track your progress."
      });
    }
    // Fix: Using the correct route format with lessonId parameter
    navigate(`/app/exercise/${lessonId}`);
  };

  return (
    <div className="space-y-4">
      <Button 
        className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        onClick={handleStartLesson}
      >
        Start Lesson
      </Button>
      
      {isGuest && (
        <Button 
          variant="outline"
          className="w-full" 
          onClick={() => navigate('/auth?tab=signup')}
        >
          Sign Up to Save Progress
        </Button>
      )}
    </div>
  );
};
