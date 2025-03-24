
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Check, X } from "lucide-react";
import { toast } from "sonner";

const Exercise = () => {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Mock data - would come from API in real app
  const exercises = [
    {
      id: "1",
      type: "multiple_choice",
      question: "What does 'こんにちは' mean?",
      options: ["Hello", "Goodbye", "Good morning", "Thank you"],
      correctAnswer: "Hello",
      japanese: "こんにちは",
      romaji: "konnichiwa",
      xpReward: 5,
    },
    {
      id: "2",
      type: "multiple_choice",
      question: "How do you say 'Nice to meet you' in Japanese?",
      options: ["さようなら", "ありがとう", "はじめまして", "おはよう"],
      correctAnswer: "はじめまして",
      japanese: "はじめまして",
      romaji: "hajimemashite",
      xpReward: 5,
    },
    {
      id: "3",
      type: "translation",
      question: "Translate to English: 私はジョンです",
      options: ["My name is John", "I am John", "Hello John", "Thank you John"],
      correctAnswer: "I am John",
      japanese: "私はジョンです",
      romaji: "watashi wa jon desu",
      xpReward: 5,
    },
  ];

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;
  
  const handleSelectAnswer = (answer: string) => {
    if (!isAnswerChecked) {
      setSelectedAnswer(answer);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswerChecked(true);
    if (selectedAnswer === currentExercise.correctAnswer) {
      toast.success("Correct answer!");
      setXpEarned(xpEarned + currentExercise.xpReward);
    } else {
      toast.error("Not quite right");
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      // Navigate to lesson complete screen
      navigate(`/app/lesson-complete/1`);
    }
  };

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
              {/* Add romaji pronunciation when Japanese text is in the question */}
              {currentExercise.question.includes("'") && (
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{currentExercise.romaji}</span> <span className="text-xs italic">(pronunciation)</span>
                </div>
              )}
            </div>
            
            {currentExercise.type === "multiple_choice" && (
              <div className="space-y-3">
                {currentExercise.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full justify-start py-6 px-4 h-auto text-left font-normal transition-all ${
                      selectedAnswer === option
                        ? isAnswerChecked
                          ? option === currentExercise.correctAnswer
                            ? "border-nihongo-green bg-nihongo-green/5 hover:bg-nihongo-green/5"
                            : "border-nihongo-error bg-nihongo-error/5 hover:bg-nihongo-error/5"
                          : "border-nihongo-blue bg-nihongo-blue/5 hover:bg-nihongo-blue/5"
                        : "border-gray-200 hover:border-nihongo-blue/50"
                    }`}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={isAnswerChecked && option !== currentExercise.correctAnswer && option !== selectedAnswer}
                  >
                    <div className="flex items-center w-full justify-between">
                      <span>{option}</span>
                      {isAnswerChecked && option === currentExercise.correctAnswer && (
                        <Check className="w-5 h-5 text-nihongo-green" />
                      )}
                      {isAnswerChecked && option === selectedAnswer && option !== currentExercise.correctAnswer && (
                        <X className="w-5 h-5 text-nihongo-error" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {/* For translation exercises, using same UI as multiple choice for the MVP */}
            {currentExercise.type === "translation" && (
              <div className="space-y-3">
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-japanese text-center mb-2">{currentExercise.japanese}</p>
                  <p className="text-sm text-center font-medium">{currentExercise.romaji}</p>
                  <p className="text-xs text-muted-foreground text-center italic mt-1">pronunciation</p>
                </div>
                {currentExercise.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full justify-start py-6 px-4 h-auto text-left font-normal transition-all ${
                      selectedAnswer === option
                        ? isAnswerChecked
                          ? option === currentExercise.correctAnswer
                            ? "border-nihongo-green bg-nihongo-green/5 hover:bg-nihongo-green/5"
                            : "border-nihongo-error bg-nihongo-error/5 hover:bg-nihongo-error/5"
                          : "border-nihongo-blue bg-nihongo-blue/5 hover:bg-nihongo-blue/5"
                        : "border-gray-200 hover:border-nihongo-blue/50"
                    }`}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={isAnswerChecked && option !== currentExercise.correctAnswer && option !== selectedAnswer}
                  >
                    <div className="flex items-center w-full justify-between">
                      <span>{option}</span>
                      {isAnswerChecked && option === currentExercise.correctAnswer && (
                        <Check className="w-5 h-5 text-nihongo-green" />
                      )}
                      {isAnswerChecked && option === selectedAnswer && option !== currentExercise.correctAnswer && (
                        <X className="w-5 h-5 text-nihongo-error" />
                      )}
                    </div>
                  </Button>
                ))}
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
