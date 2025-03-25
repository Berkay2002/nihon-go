
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Check, X, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import contentService, { Exercise as ExerciseType } from "@/services/contentService";
import userProgressService, { useUserProgress, ExerciseResult } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";

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
  const progress = exercises.length > 0 ? ((currentExerciseIndex + 1) / exercises.length) * 100 : 0;
  
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
          const result: ExerciseResult = {
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

  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nihongo-red"></div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No exercises found</h1>
          <Button onClick={() => navigate(`/app/lesson/${lessonId}`)}>
            Return to Lesson
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center bg-nihongo-red/10 px-3 py-1 rounded-full">
            <Zap className="w-4 h-4 text-nihongo-red mr-1" />
            <span className="text-xs font-medium text-nihongo-red">+{xpEarned} XP</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentExerciseIndex + 1}/{exercises.length}
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-gray-100" />
      </header>

      <section className="mb-8">
        <Card className="border border-nihongo-blue/10 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{currentExercise.question}</h2>
              {currentExercise.romaji && (
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{currentExercise.romaji}</span> <span className="text-xs italic">(pronunciation)</span>
                </div>
              )}
            </div>
            
            {currentExercise.type === "multiple_choice" && (
              <div className="space-y-3">
                {Array.isArray(currentExercise.options) ? (
                  currentExercise.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full justify-start py-6 px-4 h-auto text-left font-normal transition-all ${
                        selectedAnswer === option
                          ? isAnswerChecked
                            ? option === currentExercise.correct_answer
                              ? "border-nihongo-green bg-nihongo-green/5 hover:bg-nihongo-green/5"
                              : "border-nihongo-error bg-nihongo-error/5 hover:bg-nihongo-error/5"
                            : "border-nihongo-blue bg-nihongo-blue/5 hover:bg-nihongo-blue/5"
                          : "border-gray-200 hover:border-nihongo-blue/50"
                      }`}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={isAnswerChecked && option !== currentExercise.correct_answer && option !== selectedAnswer}
                    >
                      <div className="flex items-center w-full justify-between">
                        <span>{option}</span>
                        {isAnswerChecked && option === currentExercise.correct_answer && (
                          <Check className="w-5 h-5 text-nihongo-green" />
                        )}
                        {isAnswerChecked && option === selectedAnswer && option !== currentExercise.correct_answer && (
                          <X className="w-5 h-5 text-nihongo-error" />
                        )}
                      </div>
                    </Button>
                  ))
                ) : (
                  <p className="text-red-500">Error: Options are not properly formatted</p>
                )}
              </div>
            )}

            {currentExercise.type === "text_input" && (
              <div className="space-y-4">
                <div className="mb-2">
                  <Input
                    type="text"
                    placeholder="Type your answer here..."
                    value={textAnswer}
                    onChange={handleTextAnswerChange}
                    disabled={isAnswerChecked}
                    className={`w-full py-6 px-4 text-lg ${
                      isAnswerChecked
                        ? textAnswer && currentExercise.correct_answer.split(',').map(a => a.trim().toLowerCase()).includes(textAnswer.toLowerCase())
                          ? "border-nihongo-green bg-nihongo-green/5"
                          : "border-nihongo-error bg-nihongo-error/5"
                        : ""
                    }`}
                  />
                </div>
                
                {isAnswerChecked && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-lg">
                      {textAnswer && currentExercise.correct_answer.split(',').map(a => a.trim().toLowerCase()).includes(textAnswer.toLowerCase())
                        ? <span className="flex items-center text-nihongo-green"><Check className="w-5 h-5 mr-2" /> Correct!</span>
                        : <span className="flex items-center text-nihongo-error"><X className="w-5 h-5 mr-2" /> Incorrect</span>
                      }
                    </p>
                    <p className="mt-2">
                      Correct answer: <span className="font-medium">{currentExercise.correct_answer}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentExercise.type === "arrange_sentence" && (
              <div className="space-y-4">
                {/* Area for arranged words */}
                <div className="min-h-16 p-4 border border-dashed rounded-lg border-gray-300 flex flex-wrap gap-2 mb-4">
                  {arrangedWords.length > 0 ? (
                    arrangedWords.map((word, index) => (
                      <Button
                        key={`arranged-${index}`}
                        variant="outline"
                        className="bg-nihongo-blue/10 hover:bg-nihongo-blue/15"
                        onClick={() => handleRemoveWord(index)}
                        disabled={isAnswerChecked}
                      >
                        {word}
                      </Button>
                    ))
                  ) : (
                    <div className="w-full text-center text-muted-foreground py-2">
                      Tap words below to arrange them here
                    </div>
                  )}
                </div>
                
                {/* Available words */}
                <div className="flex flex-wrap gap-2">
                  {availableWords.map((word, index) => (
                    <Button
                      key={`available-${index}`}
                      variant="outline"
                      onClick={() => handleAddWord(word, index)}
                      disabled={isAnswerChecked}
                    >
                      {word}
                    </Button>
                  ))}
                </div>
                
                {isAnswerChecked && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-lg">
                      {arrangedWords.join("") === currentExercise.correct_answer.replace(/\s+/g, "")
                        ? <span className="flex items-center text-nihongo-green"><Check className="w-5 h-5 mr-2" /> Correct!</span>
                        : <span className="flex items-center text-nihongo-error"><X className="w-5 h-5 mr-2" /> Incorrect</span>
                      }
                    </p>
                    <p className="mt-2">
                      Correct answer: <span className="font-medium">{currentExercise.correct_answer}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentExercise.type === "translation" && (
              <div className="space-y-3">
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-japanese text-center mb-2">{currentExercise.japanese}</p>
                  <p className="text-sm text-center font-medium">{currentExercise.romaji}</p>
                  <p className="text-xs text-muted-foreground text-center italic mt-1">pronunciation</p>
                </div>
                {Array.isArray(currentExercise.options) ? (
                  currentExercise.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full justify-start py-6 px-4 h-auto text-left font-normal transition-all ${
                        selectedAnswer === option
                          ? isAnswerChecked
                            ? option === currentExercise.correct_answer
                              ? "border-nihongo-green bg-nihongo-green/5 hover:bg-nihongo-green/5"
                              : "border-nihongo-error bg-nihongo-error/5 hover:bg-nihongo-error/5"
                            : "border-nihongo-blue bg-nihongo-blue/5 hover:bg-nihongo-blue/5"
                          : "border-gray-200 hover:border-nihongo-blue/50"
                      }`}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={isAnswerChecked && option !== currentExercise.correct_answer && option !== selectedAnswer}
                    >
                      <div className="flex items-center w-full justify-between">
                        <span>{option}</span>
                        {isAnswerChecked && option === currentExercise.correct_answer && (
                          <Check className="w-5 h-5 text-nihongo-green" />
                        )}
                        {isAnswerChecked && option === selectedAnswer && option !== currentExercise.correct_answer && (
                          <X className="w-5 h-5 text-nihongo-error" />
                        )}
                      </div>
                    </Button>
                  ))
                ) : (
                  <p className="text-red-500">Error: Options are not properly formatted</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {!isAnswerChecked ? (
          <Button 
            className="w-full bg-nihongo-blue hover:bg-nihongo-blue/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleCheckAnswer}
            disabled={(currentExercise.type === "multiple_choice" && selectedAnswer === null) || 
                     (currentExercise.type === "text_input" && !textAnswer.trim()) ||
                     (currentExercise.type === "arrange_sentence" && arrangedWords.length === 0)}
          >
            Check Answer
          </Button>
        ) : (
          <Button 
            className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleNextExercise}
          >
            {currentExerciseIndex < exercises.length - 1 ? "Next Exercise" : "Complete Lesson"}
          </Button>
        )}
      </section>
    </div>
  );
};

export default Exercise;
