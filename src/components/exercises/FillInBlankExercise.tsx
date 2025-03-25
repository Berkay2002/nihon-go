
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { ExerciseType } from "@/types/exercises";

interface FillInBlankExerciseProps {
  exercise: ExerciseType;
  textAnswer: string;
  isAnswerChecked: boolean;
  onTextAnswerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FillInBlankExercise = ({
  exercise,
  textAnswer,
  isAnswerChecked,
  onTextAnswerChange,
}: FillInBlankExerciseProps) => {
  // Function to check if the answer is correct, with some flexibility
  const isCorrect = () => {
    if (!textAnswer) return false;
    
    const possibleAnswers = exercise.correct_answer
      .split(',')
      .map(a => a.trim().toLowerCase());
    
    return possibleAnswers.includes(textAnswer.toLowerCase());
  };

  // Split the question to find the blank part
  const questionParts = exercise.question.split('_____');
  
  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">
        {questionParts.length > 1 ? (
          <div className="flex flex-wrap items-center">
            <span>{questionParts[0]}</span>
            <div className="mx-2 inline-block min-w-[120px]">
              <Input
                type="text"
                value={textAnswer}
                onChange={onTextAnswerChange}
                disabled={isAnswerChecked}
                className={`w-full text-center border-b-2 ${
                  isAnswerChecked
                    ? isCorrect()
                      ? "border-nihongo-green bg-nihongo-green/5"
                      : "border-nihongo-error bg-nihongo-error/5"
                    : "border-dashed"
                }`}
                placeholder="Type answer here"
              />
            </div>
            <span>{questionParts[1]}</span>
          </div>
        ) : (
          <div className="mb-4">{exercise.question}</div>
        )}
      </div>
      
      {isAnswerChecked && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <p className="font-medium text-lg">
            {isCorrect() ? (
              <span className="flex items-center text-nihongo-green">
                <Check className="w-5 h-5 mr-2" /> Correct!
              </span>
            ) : (
              <span className="flex items-center text-nihongo-error">
                <X className="w-5 h-5 mr-2" /> Incorrect
              </span>
            )}
          </p>
          <p className="mt-2">
            Correct answer: <span className="font-medium">{exercise.correct_answer}</span>
          </p>
        </div>
      )}
    </div>
  );
};
