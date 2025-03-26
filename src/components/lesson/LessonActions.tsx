
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LessonActionsProps {
  lessonId: string;
  isCompleted?: boolean;
}

export const LessonActions: React.FC<LessonActionsProps> = ({ 
  lessonId,
  isCompleted = false
}) => {
  const navigate = useNavigate();
  
  const handleStartExercise = () => {
    navigate(`/app/exercise/${lessonId}`);
  };
  
  const handleBackToUnits = () => {
    navigate('/app/units');
  };
  
  return (
    <div className="mt-8 flex flex-col gap-3">
      <Button 
        onClick={handleStartExercise}
        className="w-full bg-nihongo-green hover:bg-nihongo-green/90 text-white py-6 text-lg"
      >
        {isCompleted ? 'Practice Again' : 'Start Exercises'}
      </Button>
      
      <Button 
        onClick={handleBackToUnits}
        variant="outline" 
        className="w-full py-5"
      >
        Back to Units
      </Button>
    </div>
  );
};
