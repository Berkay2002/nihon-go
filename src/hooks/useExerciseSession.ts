
import { useAuth } from "@/hooks/useAuth";
import { ExerciseType } from "@/types/exercises";
import { useExerciseState } from "./exercise/useExerciseState";
import { useExerciseFetching } from "./exercise/useExerciseFetching";
import { useAnswerHandling } from "./exercise/useAnswerHandling";
import { useExerciseNavigation } from "./exercise/useExerciseNavigation";
import { useResetForm } from "./exercise/useResetForm";

export const useExerciseSession = (lessonId: string | undefined) => {
  const { user } = useAuth();
  
  // Get state from useExerciseState hook
  const {
    exercises,
    setExercises,
    incorrectExercises,
    setIncorrectExercises,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    isAnswerChecked,
    setIsAnswerChecked,
    isReviewMode,
    setIsReviewMode,
    isLoading,
    setIsLoading,
    error,
    setError,
    xpEarned,
    setXpEarned,
    totalCorrect,
    setTotalCorrect,
    totalAnswered,
    setTotalAnswered,
    selectedAnswer,
    setSelectedAnswer,
    textAnswer,
    setTextAnswer,
    arrangedWords,
    setArrangedWords,
    availableWords,
    setAvailableWords,
    matchingResult,
    setMatchingResult,
    getCurrentExercise
  } = useExerciseState();

  // Calculate current exercise
  const currentExercise = getCurrentExercise(
    exercises, 
    incorrectExercises, 
    isReviewMode, 
    currentExerciseIndex
  );

  // Fetch exercises
  useExerciseFetching(lessonId, setExercises, setIsLoading, setError);

  // Get answer handling functions
  const {
    handleSelectAnswer: _handleSelectAnswer,
    handleTextAnswerChange: _handleTextAnswerChange,
    handleAddWord: _handleAddWord,
    handleRemoveWord: _handleRemoveWord,
    handleMatchingResult: _handleMatchingResult,
    isAnswerCorrect: _isAnswerCorrect,
    getUserAnswer: _getUserAnswer
  } = useAnswerHandling();

  // Get navigation functions
  const {
    handleCheckAnswer: _handleCheckAnswer,
    handleNextExercise: _handleNextExercise
  } = useExerciseNavigation();

  // Reset form when changing exercises
  useResetForm(
    currentExerciseIndex,
    isReviewMode,
    currentExercise,
    setAvailableWords,
    setArrangedWords,
    setSelectedAnswer,
    setTextAnswer,
    setIsAnswerChecked,
    setMatchingResult
  );

  // Create wrapped handler functions that use our state
  const handleSelectAnswer = (answer: string) => {
    _handleSelectAnswer(answer, setSelectedAnswer);
  };

  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    _handleTextAnswerChange(e, setTextAnswer);
  };

  const handleAddWord = (word: string, index: number) => {
    _handleAddWord(
      word, 
      index, 
      arrangedWords, 
      availableWords, 
      setArrangedWords, 
      setAvailableWords
    );
  };

  const handleRemoveWord = (index: number) => {
    _handleRemoveWord(
      index, 
      arrangedWords, 
      availableWords, 
      setArrangedWords, 
      setAvailableWords
    );
  };

  const handleMatchingResult = (isCorrect: boolean) => {
    _handleMatchingResult(isCorrect, setMatchingResult);
  };

  const isAnswerCorrect = (): boolean => {
    return _isAnswerCorrect(
      currentExercise,
      selectedAnswer,
      textAnswer,
      arrangedWords,
      matchingResult
    );
  };

  const getUserAnswer = (): string => {
    return _getUserAnswer(
      currentExercise,
      selectedAnswer,
      textAnswer,
      arrangedWords,
      matchingResult
    );
  };

  const handleCheckAnswer = () => {
    _handleCheckAnswer(
      currentExercise,
      isAnswerCorrect(),
      setIsAnswerChecked,
      setTotalAnswered,
      setTotalCorrect,
      setXpEarned,
      setIncorrectExercises,
      isReviewMode
    );
  };

  const handleNextExercise = async () => {
    return _handleNextExercise(
      user,
      currentExercise,
      isAnswerChecked,
      isAnswerCorrect(),
      getUserAnswer,
      lessonId,
      currentExerciseIndex,
      isReviewMode,
      exercises,
      incorrectExercises,
      setCurrentExerciseIndex,
      setIsReviewMode,
      setIncorrectExercises
    );
  };

  return {
    exercises,
    incorrectExercises,
    currentExercise,
    currentExerciseIndex,
    isAnswerChecked,
    isReviewMode,
    isLoading,
    error,
    xpEarned,
    totalCorrect,
    totalAnswered,
    selectedAnswer,
    textAnswer,
    arrangedWords,
    availableWords,
    matchingResult,
    handleSelectAnswer,
    handleTextAnswerChange,
    handleAddWord,
    handleRemoveWord,
    handleMatchingResult,
    handleCheckAnswer,
    handleNextExercise
  };
};
