
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export interface NoExercisesFoundProps {
  lessonId?: string;
  error?: string;
}

export const NoExercisesFound: React.FC<NoExercisesFoundProps> = ({ 
  lessonId,
  error = "No exercises found for this lesson."
}) => {
  const navigate = useNavigate();
  
  const handleBackToLesson = () => {
    if (lessonId) {
      navigate(`/app/lesson/${lessonId}`);
    } else {
      navigate("/app/units");
    }
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-8 w-16 h-16 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-yellow-500" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2 text-high-contrast">Exercise Not Available</h2>
      <p className="text-medium-contrast mb-8 max-w-sm">{error}</p>
      
      <div className="space-y-4 w-full max-w-sm">
        <Button 
          onClick={handleBackToLesson}
          className="w-full"
        >
          {lessonId ? "Back to Lesson" : "Back to Units"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate("/app/units")}
          className="w-full"
        >
          Go to All Units
        </Button>
      </div>
    </div>
  );
};
