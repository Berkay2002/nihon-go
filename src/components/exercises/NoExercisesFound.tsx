
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface NoExercisesFoundProps {
  lessonId: string;
  error?: string;
}

export const NoExercisesFound: React.FC<NoExercisesFoundProps> = ({ 
  lessonId,
  error = "No exercises found for this lesson."
}) => {
  const navigate = useNavigate();
  
  const handleBackToLesson = () => {
    navigate(`/app/lesson/${lessonId}`);
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-8 w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <span className="text-2xl">📝</span>
      </div>
      
      <h2 className="text-xl font-bold mb-2 text-high-contrast">No Exercises Available</h2>
      <p className="text-medium-contrast mb-8 max-w-sm">{error}</p>
      
      <div className="space-y-4 w-full max-w-sm">
        <Button 
          onClick={handleBackToLesson}
          className="w-full"
        >
          Back to Lesson
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate("/app/units")}
          className="w-full"
        >
          Go to Units
        </Button>
      </div>
    </div>
  );
};
