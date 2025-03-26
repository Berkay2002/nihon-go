
import { normalizeJapaneseText, areJapaneseTextsSimilar } from "@/lib/utils";
import { ExerciseType } from "@/types/exercises";

/**
 * Hook for handling exercise answers
 */
export const useAnswerHandling = () => {
  // Handle user's answer selection for multiple choice questions
  const handleSelectAnswer = (
    answer: string,
    setSelectedAnswer: (answer: string) => void
  ) => {
    setSelectedAnswer(answer);
  };

  // Handle user's text input for text-based questions
  const handleTextAnswerChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setTextAnswer: (text: string) => void
  ) => {
    setTextAnswer(e.target.value);
  };

  // Handle adding a word to the arranged sentence
  const handleAddWord = (
    word: string, 
    index: number,
    arrangedWords: string[],
    availableWords: string[],
    setArrangedWords: (words: string[]) => void,
    setAvailableWords: (words: string[]) => void
  ) => {
    setArrangedWords([...arrangedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  // Handle removing a word from the arranged sentence
  const handleRemoveWord = (
    index: number,
    arrangedWords: string[],
    availableWords: string[],
    setArrangedWords: (words: string[]) => void,
    setAvailableWords: (words: string[]) => void
  ) => {
    const removedWord = arrangedWords[index];
    setArrangedWords(arrangedWords.filter((_, i) => i !== index));
    setAvailableWords([...availableWords, removedWord]);
  };

  // Handle matching result
  const handleMatchingResult = (
    isCorrect: boolean,
    setMatchingResult: (result: boolean) => void
  ) => {
    setMatchingResult(isCorrect);
  };

  // Determine if the answer is correct
  const isAnswerCorrect = (
    currentExercise: ExerciseType | null,
    selectedAnswer: string | null,
    textAnswer: string,
    arrangedWords: string[],
    matchingResult: boolean | null
  ): boolean => {
    if (!currentExercise) return false;

    switch (currentExercise.type) {
      case "multiple_choice":
      case "translation":
        return selectedAnswer === currentExercise.correct_answer;
      case "text_input":
        // Use more forgiving text comparison
        return areJapaneseTextsSimilar(textAnswer, currentExercise.correct_answer);
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
        
        return areJapaneseTextsSimilar(userAnswer, correctAnswer);
      case "matching":
        return matchingResult === true;
      case "fill_in_blank":
        // Use more forgiving text comparison
        return areJapaneseTextsSimilar(textAnswer, currentExercise.correct_answer);
      default:
        return false;
    }
  };

  // Get user's answer as a string (for display and tracking)
  const getUserAnswer = (
    currentExercise: ExerciseType | null,
    selectedAnswer: string | null,
    textAnswer: string,
    arrangedWords: string[],
    matchingResult: boolean | null
  ): string => {
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

  return {
    handleSelectAnswer,
    handleTextAnswerChange,
    handleAddWord,
    handleRemoveWord,
    handleMatchingResult,
    isAnswerCorrect,
    getUserAnswer
  };
};
