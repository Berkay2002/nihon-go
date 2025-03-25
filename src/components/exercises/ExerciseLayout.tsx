
import React from "react";
import { ExerciseType } from "@/types/exercises";
import { ExerciseProgress, ExerciseQuestion, ExerciseActions } from "@/components/exercises";

interface ExerciseLayoutProps {
  currentExercise: ExerciseType;
  isReviewMode: boolean;
  currentExerciseIndex: number;
  totalExercises: number;
  xpEarned: number;
  selectedAnswer: string | null;
  textAnswer: string;
  arrangedWords: string[];
  availableWords: string[];
  isAnswerChecked: boolean;
  isLastExercise: boolean;
  isInputValid: boolean;
  onSelectAnswer: (answer: string) => void;
  onTextAnswerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddWord: (word: string, index: number) => void;
  onRemoveWord: (index: number) => void;
  onMatchingResult: (isCorrect: boolean) => void;
  onCheckAnswer: () => void;
  onNextExercise: () => Promise<{ completed: boolean; lessonId?: string }>;
}

export const ExerciseLayout: React.FC<ExerciseLayoutProps> = ({
  currentExercise,
  isReviewMode,
  currentExerciseIndex,
  totalExercises,
  xpEarned,
  selectedAnswer,
  textAnswer,
  arrangedWords,
  availableWords,
  isAnswerChecked,
  isLastExercise,
  isInputValid,
  onSelectAnswer,
  onTextAnswerChange,
  onAddWord,
  onRemoveWord,
  onMatchingResult,
  onCheckAnswer,
  onNextExercise
}) => {
  const handleNextExerciseClick = async () => {
    const result = await onNextExercise();
    if (result.completed && result.lessonId) {
      window.location.href = `/app/lesson-complete/${result.lessonId}`;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-20 md:pb-4">
      <div className="container max-w-md mx-auto px-4 pt-4">
        {isReviewMode && (
          <div className="mb-4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg text-yellow-800 dark:text-yellow-300">
            Review Mode: Let's fix the questions you missed
          </div>
        )}
        
        <ExerciseProgress 
          currentIndex={currentExerciseIndex} 
          totalExercises={totalExercises} 
          xpEarned={xpEarned} 
        />

        <ExerciseQuestion
          exercise={currentExercise}
          selectedAnswer={selectedAnswer}
          textAnswer={textAnswer}
          arrangedWords={arrangedWords}
          availableWords={availableWords}
          isAnswerChecked={isAnswerChecked}
          onSelectAnswer={onSelectAnswer}
          onTextAnswerChange={onTextAnswerChange}
          onAddWord={onAddWord}
          onRemoveWord={onRemoveWord}
          onMatchingResult={onMatchingResult}
        />
      </div>

      <ExerciseActions
        isAnswerChecked={isAnswerChecked}
        isLastExercise={isLastExercise}
        isInputValid={isInputValid}
        isReviewMode={isReviewMode}
        onCheckAnswer={onCheckAnswer}
        onNextExercise={handleNextExerciseClick}
      />
    </div>
  );
};
