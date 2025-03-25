import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import contentService from "@/services/contentService";
import { useUserProgress } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";
import { ExerciseType } from "@/types/exercises";
import { toast } from "sonner";

export const useExerciseSession = (lessonId: string | undefined) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitExerciseResult } = useUserProgress();

  // State for exercise session
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [incorrectExercises, setIncorrectExercises] = useState<ExerciseType[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // State for user's answers
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [matchingResult, setMatchingResult] = useState<boolean | null>(null);

  // Define a computed currentExercise to avoid errors
  const currentExercise = isReviewMode 
    ? (incorrectExercises.length > 0 ? incorrectExercises[currentExerciseIndex] : null)
    : (exercises.length > 0 ? exercises[currentExerciseIndex] : null);

  // Fetch exercises
  useEffect(() => {
    if (!lessonId) return;

    const fetchExercises = async () => {
      try {
        console.log(`Fetching exercises for lesson: ${lessonId}`);
        setIsLoading(true);
        
        const exercisesData = await contentService.getExercisesByLesson(lessonId);
        console.log(`Fetched ${exercisesData.length} exercises`, exercisesData);
        
        if (exercisesData.length === 0) {
          setError("No exercises found for this lesson.");
          setIsLoading(false);
          return;
        }
        
        // Initialize available words for arrange sentence exercises
        const processedExercises = exercisesData.map(exercise => {
          if (exercise.type === "arrange_sentence" && exercise.options) {
            return {
              ...exercise,
              words: Array.isArray(exercise.options) ? exercise.options : 
                     (exercise.options.words || exercise.words || [])
            };
          }
          return exercise;
        });
        
        setExercises(processedExercises);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        setError("Failed to load exercises. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [lessonId]);

  // Reset answer form when changing exercises
  useEffect(() => {
    if (currentExercise?.type === "arrange_sentence" && Array.isArray(currentExercise.words)) {
      setAvailableWords([...currentExercise.words]);
      setArrangedWords([]);
    } else {
      setAvailableWords([]);
      setArrangedWords([]);
    }
    setSelectedAnswer(null);
    setTextAnswer("");
    setIsAnswerChecked(false);
    setMatchingResult(null);
  }, [currentExerciseIndex, isReviewMode, currentExercise]);

  // Handle user's answer selection for multiple choice questions
  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  // Handle user's text input for text-based questions
  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextAnswer(e.target.value);
  };

  // Handle adding a word to the arranged sentence
  const handleAddWord = (word: string, index: number) => {
    setArrangedWords([...arrangedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  // Handle removing a word from the arranged sentence
  const handleRemoveWord = (index: number) => {
    const removedWord = arrangedWords[index];
    setArrangedWords(arrangedWords.filter((_, i) => i !== index));
    setAvailableWords([...availableWords, removedWord]);
  };

  // Handle matching result
  const handleMatchingResult = (isCorrect: boolean) => {
    setMatchingResult(isCorrect);
  };

  // Determine if the answer is correct
  const isAnswerCorrect = (): boolean => {
    if (!currentExercise) return false;

    switch (currentExercise.type) {
      case "multiple_choice":
      case "translation":
        return selectedAnswer === currentExercise.correct_answer;
      case "text_input":
        return textAnswer.trim().toLowerCase() === currentExercise.correct_answer.toLowerCase();
      case "arrange_sentence":
        // Extract just the Japanese characters from each word for comparison
        const extractJapaneseChars = (word: string): string => {
          // Extract characters inside parentheses if present
          const match = word.match(/^(.*?)\s*\(.*?\)$/);
          return match ? match[1].trim() : word.trim();
        };
        
        // Join arranged words, extracting only Japanese characters if words have romaji in parentheses
        const userAnswer = arrangedWords.map(extractJapaneseChars).join("");
        const correctAnswer = normalizeJapaneseText(currentExercise.correct_answer);
        
        return normalizeJapaneseText(userAnswer) === correctAnswer;
      case "matching":
        return matchingResult === true;
      case "fill_in_blank":
        return textAnswer.trim().toLowerCase() === currentExercise.correct_answer.toLowerCase();
      default:
        return false;
    }
  };

  // Get user's answer as a string (for display and tracking)
  const getUserAnswer = (): string => {
    if (!currentExercise) return "";

    switch (currentExercise.type) {
      case "multiple_choice":
      case "translation":
        return selectedAnswer || "";
      case "text_input":
      case "fill_in_blank":
        return textAnswer;
      case "arrange_sentence":
        return arrangedWords.join(" ");
      case "matching":
        return matchingResult ? "Correct matches" : "Incorrect matches";
      default:
        return "";
    }
  };

  // Handle checking the answer
  const handleCheckAnswer = () => {
    const correct = isAnswerCorrect();
    setIsAnswerChecked(true);
    setTotalAnswered(prev => prev + 1);
    
    if (correct) {
      setTotalCorrect(prev => prev + 1);
      setXpEarned(prev => prev + (currentExercise?.xp_reward || 0));
      toast.success("Correct answer!", { duration: 1500 });
    } else {
      toast.error("Incorrect. Try to remember this one.", { duration: 2000 });
      if (!isReviewMode && currentExercise) {
        setIncorrectExercises(prev => [...prev, currentExercise]);
      }
    }
  };

  // Handle moving to the next exercise
  const handleNextExercise = async () => {
    // If we're checking an answer, submit the result
    if (user && currentExercise && isAnswerChecked) {
      try {
        await submitExerciseResult({
          lessonId: lessonId || "",
          exerciseId: currentExercise.id,
          isCorrect: isAnswerCorrect(),
          userAnswer: getUserAnswer(),
          timeSpent: 0,
          xpEarned: isAnswerCorrect() ? (currentExercise.xp_reward || 0) : 0
        });
      } catch (error) {
        console.error("Error submitting exercise result:", error);
        // Continue anyway - this is not critical
      }
    }

    const currentArray = isReviewMode ? incorrectExercises : exercises;
    const isLastExercise = currentExerciseIndex >= currentArray.length - 1;

    if (!isLastExercise) {
      // Move to next exercise
      setCurrentExerciseIndex(prev => prev + 1);
    } else if (isReviewMode) {
      // Last exercise in review mode
      if (isAnswerCorrect()) {
        // Remove this question from incorrect questions
        const updatedIncorrect = incorrectExercises.filter((_, idx) => idx !== currentExerciseIndex);
        setIncorrectExercises(updatedIncorrect);
        
        if (updatedIncorrect.length === 0) {
          // All incorrect questions now correct - complete the lesson
          return { completed: true, lessonId };
        } else {
          // More incorrect questions to review
          setCurrentExerciseIndex(0);
          toast.info(`${updatedIncorrect.length} questions left to review`);
          return { completed: false };
        }
      } else {
        // Keep in incorrect questions, but cycle to the beginning
        setCurrentExerciseIndex(0);
        return { completed: false };
      }
    } else {
      // Finished main exercises
      if (incorrectExercises.length > 0) {
        // Enter review mode
        setIsReviewMode(true);
        setCurrentExerciseIndex(0);
        toast.info("Let's review the questions you got wrong", {
          description: "You need to answer all questions correctly to complete the lesson"
        });
        return { completed: false };
      } else {
        // No incorrect questions - complete!
        return { completed: true, lessonId };
      }
    }
    
    return { completed: false };
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
