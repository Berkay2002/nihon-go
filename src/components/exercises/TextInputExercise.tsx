
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { ExerciseType } from "@/types/exercises";

interface TextInputExerciseProps {
  exercise: ExerciseType;
  textAnswer: string;
  isAnswerChecked: boolean;
  onTextAnswerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextInputExercise = ({
  exercise,
  textAnswer,
  isAnswerChecked,
  onTextAnswerChange,
}: TextInputExerciseProps) => {
  const isCorrect = textAnswer && 
    exercise.correct_answer
      .split(',')
      .map(a => a.trim().toLowerCase())
      .includes(textAnswer.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <Input
          type="text"
          placeholder="Type your answer here..."
          value={textAnswer}
          onChange={onTextAnswerChange}
          disabled={isAnswerChecked}
          className={`w-full py-6 px-4 text-lg ${
            isAnswerChecked
              ? isCorrect
                ? "border-nihongo-green bg-nihongo-green/5"
                : "border-nihongo-error bg-nihongo-error/5"
              : ""
          }`}
        />
      </div>
      
      {isAnswerChecked && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium text-lg">
            {isCorrect
              ? <span className="flex items-center text-nihongo-green"><Check className="w-5 h-5 mr-2" /> Correct!</span>
              : <span className="flex items-center text-nihongo-error"><X className="w-5 h-5 mr-2" /> Incorrect</span>
            }
          </p>
          <p className="mt-2">
            Correct answer: <span className="font-medium">{exercise.correct_answer}</span>
          </p>
        </div>
      )}
    </div>
  );
};
