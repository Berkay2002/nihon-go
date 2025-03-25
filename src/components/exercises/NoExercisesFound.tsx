
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NoExercisesFoundProps {
  lessonId: string | undefined;
}

export const NoExercisesFound = ({ lessonId }: NoExercisesFoundProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-md mx-auto px-4 pt-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">No exercises found</h1>
        <Button onClick={() => navigate(`/app/lesson/${lessonId}`)}>
          Return to Lesson
        </Button>
      </div>
    </div>
  );
};
