
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const LoadingExercise = () => {
  return (
    <div className="container max-w-md mx-auto px-4 pt-6 flex items-center justify-center h-[80vh]">
      <LoadingSpinner />
    </div>
  );
};
