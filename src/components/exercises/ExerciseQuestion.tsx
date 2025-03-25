import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExerciseType } from "@/types/exercises";
import { cn } from "@/lib/utils";
import { Volume2 } from "lucide-react"; 

interface ExerciseQuestionProps {
  exercise: ExerciseType;
  selectedAnswer: string | null;
  textAnswer: string;
  arrangedWords: string[];
  availableWords: string[];
  isAnswerChecked: boolean;
  onSelectAnswer: (answer: string) => void;
  onTextAnswerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddWord: (word: string, index: number) => void;
  onRemoveWord: (index: number) => void;
}

export const ExerciseQuestion: React.FC<ExerciseQuestionProps> = ({
  exercise,
  selectedAnswer,
  textAnswer,
  arrangedWords,
  availableWords,
  isAnswerChecked,
  onSelectAnswer,
  onTextAnswerChange,
  onAddWord,
  onRemoveWord,
}) => {
  const playAudio = () => {
    if (exercise.audio_url) {
      const audio = new Audio(exercise.audio_url);
      audio.play().catch(error => console.error("Error playing audio:", error));
    }
  };

  return (
    <div className="mb-6">
      {/* Exercise Question */}
      <div className="mb-8 text-center">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-slate-500 mb-3">
          {exercise.type === "multiple_choice" && "Select the correct answer"}
          {exercise.type === "translation" && "Translate this text"}
          {exercise.type === "text_input" && "Type your answer"}
          {exercise.type === "arrange_sentence" && "Arrange the words to form a sentence"}
        </h2>
        
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            {exercise.question}
          </h1>
          
          {exercise.audio_url && (
            <button 
              onClick={playAudio}
              className="ml-3 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
              <Volume2 size={20} className="text-blue-500" />
            </button>
          )}
        </div>

        {exercise.image_url && (
          <div className="max-w-sm mx-auto mb-6">
            <div className="h-48 rounded-2xl overflow-hidden shadow-md">
              <img 
                src={exercise.image_url} 
                alt={exercise.question}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/400x300/667/fff?text=Image";
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Multiple Choice or Translation Exercise */}
      {["multiple_choice", "translation"].includes(exercise.type) && (
        <div className="grid grid-cols-1 gap-3">
          {exercise.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => onSelectAnswer(option)}
              disabled={isAnswerChecked}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden",
                selectedAnswer === option && isAnswerChecked && option === exercise.correct_answer
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : selectedAnswer === option && isAnswerChecked
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : selectedAnswer === option
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                isAnswerChecked && option === exercise.correct_answer && "border-green-500 bg-green-50 dark:bg-green-900/20"
              )}
            >
              <div className="flex items-center">
                {option.includes("http") ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mr-3 flex-shrink-0">
                    <img
                      src={option}
                      alt="Option"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/100x100/667/fff?text=Image";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0 dark:bg-slate-700">
                    <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                  </div>
                )}
                <span className="font-medium">{option}</span>
              </div>
              
              {/* Indicator badges for correct/incorrect */}
              {isAnswerChecked && selectedAnswer === option && option === exercise.correct_answer && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {isAnswerChecked && selectedAnswer === option && option !== exercise.correct_answer && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Text Input Exercise */}
      {exercise.type === "text_input" && (
        <div>
          <input
            type="text"
            value={textAnswer}
            onChange={onTextAnswerChange}
            disabled={isAnswerChecked}
            className={cn(
              "w-full p-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-offset-2",
              isAnswerChecked && textAnswer.toLowerCase() === exercise.correct_answer?.toLowerCase()
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 focus:ring-green-500"
                : isAnswerChecked
                ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700"
            )}
            placeholder="Type your answer here..."
          />
          
          {isAnswerChecked && textAnswer.toLowerCase() !== exercise.correct_answer?.toLowerCase() && (
            <div className="mt-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Correct answer:</p>
              <p className="font-medium">{exercise.correct_answer}</p>
            </div>
          )}
        </div>
      )}

      {/* Arrange Sentence Exercise */}
      {exercise.type === "arrange_sentence" && (
        <div>
          {/* Arranged words area */}
          <div className="p-4 mb-4 min-h-[80px] border-2 border-dashed rounded-xl border-slate-300 dark:border-slate-700 flex flex-wrap gap-2">
            {arrangedWords.length > 0 ? (
              arrangedWords.map((word, index) => (
                <button
                  key={`arranged-${index}`}
                  onClick={() => !isAnswerChecked && onRemoveWord(index)}
                  disabled={isAnswerChecked}
                  className="px-3 py-2 rounded-lg bg-blue-500 text-white transition-transform hover:scale-105 active:scale-95 font-medium"
                >
                  {word}
                </button>
              ))
            ) : (
              <p className="text-slate-400 dark:text-slate-500 flex items-center justify-center w-full">
                Select words to form a sentence
              </p>
            )}
          </div>

          {/* Available words */}
          <div className="flex flex-wrap gap-2">
            {availableWords.map((word, index) => (
              <button
                key={`available-${index}`}
                onClick={() => !isAnswerChecked && onAddWord(word, index)}
                disabled={isAnswerChecked}
                className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-transform hover:scale-105 active:scale-95 font-medium"
              >
                {word}
              </button>
            ))}
          </div>
          
          {isAnswerChecked && arrangedWords.join("") !== exercise.correct_answer?.replace(/\s+/g, "") && (
            <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Correct answer:</p>
              <p className="font-medium">{exercise.correct_answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
