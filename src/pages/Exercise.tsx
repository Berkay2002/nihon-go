
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import contentService from "@/services/contentService";
import { useUserProgress } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";
import { ExerciseType } from "@/types/exercises";
import {
  ExerciseProgress,
  ExerciseQuestion,
  ExerciseActions,
  LoadingExercise,
  NoExercisesFound
} from "@/components/exercises";

const Exercise = () => {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { submitExerciseResult } = useUserProgress();
  const [startTime, setStartTime] = useState<Date>(new Date());
  const lessonId = exerciseId;
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!lessonId) return;
      
      try {
        setLoading(true);
        console.log(`Fetching exercises for lesson ID: ${lessonId}`);
        const exercisesData = await contentService.getExercisesByLesson(lessonId);
        
        if (exercisesData.length === 0) {
          toast.error("No exercises found for this lesson");
          navigate(`/app/lesson/${lessonId}`);
          return;
        }
        
        setExercises(exercisesData);
        setLoading(false);
        setStartTime(new Date());
      } catch (error) {
        console.error("Error fetching exercises:", error);
        toast.error("Failed to load exercises");
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, [lessonId, navigate]);

  // Setup arrange sentence words when exercise changes
  useEffect(() => {
    if (currentExercise && currentExercise.type === "arrange_sentence" && Array.isArray(currentExercise.options)) {
      setAvailableWords([...currentExercise.options]);
      setArrangedWords([]);
    }
  }, [currentExerciseIndex, exercises]);

  const currentExercise = exercises[currentExerciseIndex];
  
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

  const handleCheckAnswer = async () => {
    if (!currentExercise) return;
    
    let isCorrect = false;
    let userAnswer = "";
    
    if (currentExercise.type === "text_input") {
      // For text input exercises, compare the text answer
      if (!textAnswer.trim()) {
        toast.error("Please enter your answer");
        return;
      }
      
      userAnswer = textAnswer.trim().toLowerCase();
      
      // Allow for multiple correct answers (separated by commas in the database)
      const correctAnswersArray = (currentExercise.correct_answer || "")
        .split(",")
        .map((answer) => answer.trim().toLowerCase());
      
      // Now check if user's answer matches ANY of the correct answers
      // or if it's part of one of the answers (for partial matching)
      isCorrect = correctAnswersArray.some(answer => {
        // Check if the user's answer is any of the correct answers
        return answer === userAnswer || 
               // Check if the user's answer is part of a correct answer (especially for cases like "konnichiwa" in "こんにちは,konnichiwa")
               (answer.includes(userAnswer) && userAnswer.length > 3) ||
               // Or if the correct answer is part of the user's answer
               (userAnswer.includes(answer) && answer.length > 3);
      });
      
      console.log("User answer:", userAnswer);
      console.log("Correct answers:", correctAnswersArray);
      console.log("Is correct:", isCorrect);
    } else if (currentExercise.type === "arrange_sentence") {
      // For arrange sentence exercises
      if (arrangedWords.length === 0) {
        toast.error("Please arrange the words");
        return;
      }
      
      userAnswer = arrangedWords.join("");
      const correctAnswer = currentExercise.correct_answer.replace(/\s+/g, "");
      
      isCorrect = userAnswer === correctAnswer;
      console.log("User arranged:", userAnswer);
      console.log("Correct arrangement:", correctAnswer);
    } else {
      // For multiple choice exercises, check the selected answer
      if (selectedAnswer === null) {
        toast.error("Please select an answer");
        return;
      }
      
      userAnswer = selectedAnswer;
      isCorrect = selectedAnswer === currentExercise.correct_answer;
    }
    
    setIsAnswerChecked(true);
    
    // Display only ONE toast message for feedback based on correctness
    if (isCorrect) {
      toast.success("Correct answer!");
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
    } else {
      toast.error("Not quite right");
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedAnswer(null);
      setTextAnswer("");
      setIsAnswerChecked(false);
      setStartTime(new Date());
      setArrangedWords([]);
      setAvailableWords([]);
    } else {
      navigate(`/app/lesson-complete/${lessonId}`);
    }
  };

  // Check if input is valid for the current exercise type
  const isInputValid = () => {
    if (!currentExercise) return false;
    
    if (currentExercise.type === "multiple_choice" || currentExercise.type === "translation") {
      return selectedAnswer !== null;
    } else if (currentExercise.type === "text_input") {
      return textAnswer.trim() !== "";
    } else if (currentExercise.type === "arrange_sentence") {
      return arrangedWords.length > 0;
    }
    
    return false;
  };

  if (loading) {
    return <LoadingExercise />;
  }

  if (!currentExercise) {
    return <NoExercisesFound lessonId={lessonId} />;
  }

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <ExerciseProgress 
        currentIndex={currentExerciseIndex} 
        totalExercises={exercises.length} 
        xpEarned={xpEarned} 
      />

      <section className="mb-8">
        <ExerciseQuestion
          exercise={currentExercise}
          selectedAnswer={selectedAnswer}
          textAnswer={textAnswer}
          arrangedWords={arrangedWords}
          availableWords={availableWords}
          isAnswerChecked={isAnswerChecked}
          onSelectAnswer={handleSelectAnswer}
          onTextAnswerChange={handleTextAnswerChange}
          onAddWord={handleAddWord}
          onRemoveWord={handleRemoveWord}
        />

        <ExerciseActions
          isAnswerChecked={isAnswerChecked}
          isLastExercise={currentExerciseIndex === exercises.length - 1}
          isInputValid={isInputValid()}
          onCheckAnswer={handleCheckAnswer}
          onNextExercise={handleNextExercise}
        />
      </section>
    </div>
  );
};

export default Exercise;
