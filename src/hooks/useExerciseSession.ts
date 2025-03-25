import { useState, useEffect } from "react";
import { useUserProgress } from "@/services/userProgressService"; 
import { useAuth } from "@/hooks/useAuth";
import contentService from "@/services/contentService";
import { ExerciseType } from "@/types/exercises";
import { normalizeJapaneseText, shuffleArray } from "@/lib/utils";
import { toast } from "sonner";

// Type for data coming from the API
interface APIExerciseData {
  id: string;
  lesson_id: string;
  type: string;
  question: string;
  options: string[];
  correct_answer: string;
  xp_reward: number;
  order_index: number;
  [key: string]: unknown;
}

export const useExerciseSession = (lessonId: string | undefined) => {
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [incorrectExercises, setIncorrectExercises] = useState<ExerciseType[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { submitExerciseResult } = useUserProgress();
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [matchingResult, setMatchingResult] = useState<boolean>(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Process and randomize exercise data
  const processExerciseData = (exercisesData: APIExerciseData[]): ExerciseType[] => {
    // Create a deep copy to avoid mutating the original data
    return exercisesData.map(exercise => {
      // Cast the type to ExerciseType since we've validated it has the required fields
      const processedExercise = { ...exercise } as unknown as ExerciseType;
      
      // For multiple choice and translation exercises, shuffle the options
      if (["multiple_choice", "translation"].includes(processedExercise.type) && Array.isArray(processedExercise.options)) {
        processedExercise.options = shuffleArray([...processedExercise.options]);
      }
      
      return processedExercise;
    });
  };

  useEffect(() => {
    const fetchExercises = async () => {
      if (!lessonId) return;
      
      try {
        setIsLoading(true);
        console.log(`Fetching exercises for lesson ID: ${lessonId}`);
        const exercisesData = await contentService.getExercisesByLesson(lessonId);
        
        if (exercisesData.length === 0) {
          return;
        }
        
        // Process and randomize exercise data
        const processed = processExerciseData(exercisesData as APIExerciseData[]);
        setExercises(processed);
        setIsLoading(false);
        setStartTime(new Date());
      } catch (error) {
        console.error("Error fetching exercises:", error);
        setIsLoading(false);
      }
    };
    
    fetchExercises();
  }, [lessonId]);

  // Setup arrange sentence words when exercise changes
  useEffect(() => {
    if (currentExercise && currentExercise.type === "arrange_sentence" && Array.isArray(currentExercise.options)) {
      // Shuffle the words for arrange sentence exercises
      setAvailableWords(shuffleArray([...currentExercise.options]));
      setArrangedWords([]);
    }
  }, [currentExerciseIndex, exercises, isReviewMode]);

  // Get the current exercise (either from main exercises or incorrect exercises in review mode)
  const currentExercise = isReviewMode 
    ? incorrectExercises[currentExerciseIndex] 
    : exercises[currentExerciseIndex];

  const handleSelectAnswer = (answer: string) => {
    if (!isAnswerChecked) {
      setSelectedAnswer(answer);
    }
  };

  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextAnswer(e.target.value);
  };

  const handleAddWord = (word: string, index: number) => {
    if (isAnswerChecked) return;
    
    setArrangedWords([...arrangedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (index: number) => {
    if (isAnswerChecked) return;
    
    const wordToRemove = arrangedWords[index];
    setArrangedWords(arrangedWords.filter((_, i) => i !== index));
    setAvailableWords([...availableWords, wordToRemove]);
  };

  const handleMatchingResult = (isCorrect: boolean) => {
    setMatchingResult(isCorrect);
  };

  const handleCheckAnswer = async () => {
    if (!currentExercise) return;
    
    let isCorrect = false;
    let userAnswer = "";
    
    if (currentExercise.type === "text_input") {
      // For text input exercises, compare the text answer
      if (!textAnswer.trim()) {
        return;
      }
      
      userAnswer = textAnswer.trim().toLowerCase();
      
      // Allow for multiple correct answers (separated by commas in the database)
      const correctAnswersArray = (currentExercise.correct_answer || "")
        .split(",")
        .map((answer) => answer.trim().toLowerCase());
      
      // Now check if user's answer matches ANY of the correct answers
      isCorrect = correctAnswersArray.some(answer => {
        // Check if the user's answer is any of the correct answers
        return answer === userAnswer || 
               // Check if the user's answer is part of a correct answer
               (answer.includes(userAnswer) && userAnswer.length > 3) ||
               // Or if the correct answer is part of the user's answer
               (userAnswer.includes(answer) && answer.length > 3);
      });
    } else if (currentExercise.type === "arrange_sentence") {
      // For arrange sentence exercises
      if (arrangedWords.length === 0) {
        return;
      }
      
      userAnswer = arrangedWords.join(" ");
      const correctAnswer = currentExercise.correct_answer;
      
      // Use normalizeJapaneseText to make validation more forgiving
      isCorrect = normalizeJapaneseText(userAnswer) === normalizeJapaneseText(correctAnswer);
    } else if (currentExercise.type === "matching") {
      // For matching exercises, the result comes from the matching component
      isCorrect = matchingResult;
      userAnswer = "matching_exercise";
    } else {
      // For multiple choice exercises, check the selected answer
      if (selectedAnswer === null) {
        return;
      }
      
      userAnswer = selectedAnswer;
      isCorrect = selectedAnswer === currentExercise.correct_answer;
    }
    
    setIsAnswerChecked(true);
    
    // Update overall tracking of correct answers
    setTotalAnswered(prevTotal => prevTotal + 1);
    if (isCorrect) {
      setTotalCorrect(prevCorrect => prevCorrect + 1);
    } else {
      // If in review mode and answer is still incorrect, keep it for another round
      if (isReviewMode) {
        // This incorrect exercise will be kept in the incorrectExercises array
      } else {
        // If in normal mode, add to incorrect exercises for review later
        setIncorrectExercises(prev => [...prev, currentExercise]);
      }
    }
    
    // Display feedback toast based on correctness
    if (isCorrect) {
      const newXp = xpEarned + currentExercise.xp_reward;
      setXpEarned(newXp);
      
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      
      if (user && lessonId) {
        try {
          const result = {
            lessonId,
            exerciseId: currentExercise.id,
            isCorrect,
            userAnswer,
            timeSpent,
            xpEarned: currentExercise.xp_reward
          };
          
          await submitExerciseResult(result);
        } catch (error) {
          console.error("Error submitting exercise result:", error);
        }
      }
    }
  };

  const completeLesson = async () => {
    // Last exercise completed - ensure the lesson is marked as completed
    if (user && lessonId) {
      try {
        // Calculate completion percentage based on total correct vs total answered
        const completionPercentage = Math.floor((totalCorrect / Math.max(totalAnswered, 1)) * 100);
        
        console.log(`Lesson ${lessonId} completed with ${completionPercentage}% accuracy`);
        
        // Mark the lesson as completed with the calculated accuracy
        await submitExerciseResult({
          lessonId,
          exerciseId: 'final-exercise',
          isCorrect: true,
          userAnswer: 'completed',
          timeSpent: 0,
          xpEarned: 0 // Additional XP will be awarded on the completion screen
        });
      } catch (error) {
        console.error("Error updating lesson completion:", error);
      }
    }
  };

  const handleNextExercise = async () => {
    const currentArray = isReviewMode ? incorrectExercises : exercises;
    const isLastExercise = currentExerciseIndex === currentArray.length - 1;
    
    if (!isLastExercise) {
      // Go to next exercise in the current array (either main or review)
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      resetExerciseState();
    } else if (isReviewMode) {
      // If we're in review mode and there are still incorrect answers
      if (incorrectExercises.length > 0) {
        // Filter out correctly answered questions
        const stillIncorrect = incorrectExercises.filter((_, index) => 
          index !== currentExerciseIndex || !isAnswerChecked);
        
        if (stillIncorrect.length > 0) {
          // If there are still incorrect exercises, reset and continue reviewing
          setIncorrectExercises(stillIncorrect);
          setCurrentExerciseIndex(0);
          resetExerciseState();
          toast.info("Let's review the remaining questions you got wrong");
        } else {
          // All review questions are correct now, proceed to completion
          await completeLesson();
          return { completed: true, lessonId };
        }
      } else {
        // No more incorrect exercises, proceed to completion
        await completeLesson();
        return { completed: true, lessonId };
      }
    } else {
      // Finished normal mode, check if we need to switch to review mode
      if (incorrectExercises.length > 0) {
        // Switch to review mode if there are incorrect exercises
        setIsReviewMode(true);
        setCurrentExerciseIndex(0);
        resetExerciseState();
        toast.info("Let's review the questions you got wrong", {
          description: "You need to answer all questions correctly to complete the lesson"
        });
      } else {
        // Check if we met the completion threshold
        const completionPercentage = (totalCorrect / totalAnswered) * 100;
        
        if (completionPercentage >= 80) { // COMPLETION_THRESHOLD
          // Met the threshold, proceed to completion
          await completeLesson();
          return { completed: true, lessonId };
        } else {
          // Didn't meet threshold, inform user and stay on the page
          toast.error(`You need to score at least 80% to complete the lesson`, {
            description: "Try again to improve your score"
          });
          // Reset the state to try the lesson again
          setCurrentExerciseIndex(0);
          setIncorrectExercises([]);
          setTotalCorrect(0);
          setTotalAnswered(0);
          resetExerciseState();
        }
      }
    }
    
    return { completed: false };
  };

  const resetExerciseState = () => {
    setSelectedAnswer(null);
    setTextAnswer("");
    setIsAnswerChecked(false);
    setStartTime(new Date());
    setArrangedWords([]);
    setAvailableWords([]);
    setMatchingResult(false);
  };

  return {
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
    matchingResult,
    handleSelectAnswer,
    handleTextAnswerChange,
    handleAddWord,
    handleRemoveWord,
    handleMatchingResult,
    handleCheckAnswer,
    handleNextExercise,
    resetExerciseState,
    completeLesson
  };
};
