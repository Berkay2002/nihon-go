
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

interface ExerciseProgressProps {
  currentIndex: number;
  totalExercises: number;
  xpEarned: number;
}

export const ExerciseProgress = ({ 
  currentIndex, 
  totalExercises, 
  xpEarned 
}: ExerciseProgressProps) => {
  const progress = totalExercises > 0 ? ((currentIndex + 1) / totalExercises) * 100 : 0;
  
  return (
    <header className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center bg-nihongo-red/10 px-3 py-1 rounded-full">
          <Zap className="w-4 h-4 text-nihongo-red mr-1" />
          <span className="text-xs font-medium text-nihongo-red">+{xpEarned} XP</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1}/{totalExercises}
        </div>
      </div>
      <Progress value={progress} className="h-2 bg-gray-100" />
    </header>
  );
};
