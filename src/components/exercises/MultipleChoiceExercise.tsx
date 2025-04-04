
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { ExerciseType } from "@/types/exercises";

interface MultipleChoiceExerciseProps {
  exercise: ExerciseType;
  selectedAnswer: string | null;
  isAnswerChecked: boolean;
  onSelectAnswer: (answer: string) => void;
}

export const MultipleChoiceExercise = ({
  exercise,
  selectedAnswer,
  isAnswerChecked,
  onSelectAnswer,
}: MultipleChoiceExerciseProps) => {
  return (
    <div className="space-y-3">
      {Array.isArray(exercise.options) ? (
        exercise.options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className={`w-full justify-start py-6 px-4 h-auto text-left font-normal transition-all ${
              selectedAnswer === option
                ? isAnswerChecked
                  ? option === exercise.correct_answer
                    ? "border-nihongo-green bg-nihongo-green/5 hover:bg-nihongo-green/5"
                    : "border-nihongo-error bg-nihongo-error/5 hover:bg-nihongo-error/5"
                  : "border-nihongo-blue bg-nihongo-blue/5 hover:bg-nihongo-blue/5"
                : "border-gray-200 hover:border-nihongo-blue/50"
            }`}
            onClick={() => onSelectAnswer(option)}
            disabled={isAnswerChecked && option !== exercise.correct_answer && option !== selectedAnswer}
          >
            <div className="flex items-center w-full justify-between">
              <span>{option}</span>
              {isAnswerChecked && option === exercise.correct_answer && (
                <Check className="w-5 h-5 text-nihongo-green" />
              )}
              {isAnswerChecked && option === selectedAnswer && option !== exercise.correct_answer && (
                <X className="w-5 h-5 text-nihongo-error" />
              )}
            </div>
          </Button>
        ))
      ) : (
        <p className="text-red-500">Error: Options are not properly formatted</p>
      )}
    </div>
  );
};
