import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Check, X } from "lucide-react";
import { toast } from "sonner";
import contentService, { Exercise as ExerciseType } from "@/services/contentService";
import userProgressService, { useUserProgress, ExerciseResult } from "@/services/userProgressService";
import { useAuth } from "@/hooks/useAuth";

const Exercise = () => {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { submitExerciseResult } = useUserProgress();
  const [startTime, setStartTime] = useState<Date>(new Date());
  const lessonId = exerciseId;

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

  const currentExercise = exercises[currentExerciseIndex];
  const progress = exercises.length > 0 ? ((currentExerciseIndex + 1) / exercises.length) * 100 : 0;
  
  const handleSelectAnswer = (answer: string) => {
    if (!isAnswerChecked) {
      setSelectedAnswer(answer);
    }
  };

  const handleCheckAnswer = async () => {
    if (selectedAnswer === null || !currentExercise) return;
    
    const isCorrect = selectedAnswer === currentExercise.correct_answer;
    setIsAnswerChecked(true);
    
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
            userAnswer: selectedAnswer,
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
      setIsAnswerChecked(false);
      setStartTime(new Date());
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
            disabled={selectedAnswer === null}
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
