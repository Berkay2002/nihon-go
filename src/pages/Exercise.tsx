
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import contentService from "@/services/contentService";
import { useUserProgress } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";
import { ExerciseType } from "@/types/exercises";
import { LoadingExercise, NoExercisesFound } from "@/components/exercises";
import { toast } from "sonner";
import { useExerciseSession } from "@/hooks/useExerciseSession";
import { ExerciseLayout } from "@/components/exercises/ExerciseLayout";

const Exercise = () => {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const { user } = useAuth();
  const lessonId = exerciseId;
  
  const {
    exercises,
    incorrectExercises,
    currentExercise,
    currentExerciseIndex,
    isAnswerChecked,
    isReviewMode,
    xpEarned,
    totalCorrect,
    totalAnswered,
    selectedAnswer,
    textAnswer,
    arrangedWords,
    availableWords,
    isLoading,
    handleSelectAnswer,
    handleTextAnswerChange,
    handleAddWord,
    handleRemoveWord,
    handleMatchingResult,
    handleCheckAnswer,
    handleNextExercise,
    matchingResult,
    error
  } = useExerciseSession(lessonId);

  console.log("Current exercise state:", {
    lessonId,
    hasExercises: exercises.length > 0,
    currentExercise,
    error
  });

  if (isLoading) {
    return <LoadingExercise />;
  }

  if (error || !currentExercise) {
    return <NoExercisesFound lessonId={lessonId || ""} />;
  }

  return (
    <ExerciseLayout
      currentExercise={currentExercise}
      isReviewMode={isReviewMode}
      currentExerciseIndex={currentExerciseIndex}
      totalExercises={isReviewMode ? incorrectExercises.length : exercises.length}
      xpEarned={xpEarned}
      selectedAnswer={selectedAnswer}
      textAnswer={textAnswer}
      arrangedWords={arrangedWords}
      availableWords={availableWords}
      isAnswerChecked={isAnswerChecked}
      onSelectAnswer={handleSelectAnswer}
      onTextAnswerChange={handleTextAnswerChange}
      onAddWord={handleAddWord}
      onRemoveWord={handleRemoveWord}
      onMatchingResult={handleMatchingResult}
      onCheckAnswer={handleCheckAnswer}
      onNextExercise={handleNextExercise}
      isLastExercise={currentExerciseIndex === (isReviewMode ? incorrectExercises.length - 1 : exercises.length - 1)}
      isInputValid={
        currentExercise.type === "multiple_choice" || currentExercise.type === "translation"
          ? selectedAnswer !== null
          : currentExercise.type === "text_input"
          ? textAnswer.trim() !== ""
          : currentExercise.type === "arrange_sentence"
          ? arrangedWords.length > 0
          : currentExercise.type === "matching"
          ? true
          : false
      }
    />
  );
};

export default Exercise;
