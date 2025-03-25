
import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Vocabulary } from "@/services/contentService";
import { ReviewItem } from "@/services/learningAlgorithmService";

interface ReviewQuestionProps {
  currentItem: ReviewItem;
  onAnswer: (correct: boolean, difficulty: number) => Promise<void>;
  reviewStats: { correct: number; incorrect: number };
  currentIndex: number;
  totalItems: number;
}

export const ReviewQuestion: React.FC<ReviewQuestionProps> = ({
  currentItem,
  onAnswer,
  reviewStats,
  currentIndex,
  totalItems
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  
  const vocabItem: Vocabulary = currentItem.item;
  
  const checkAnswer = () => {
    const isCorrect = userAnswer.trim().toLowerCase() === vocabItem.english.trim().toLowerCase();
    setAnswerCorrect(isCorrect);
    setRevealAnswer(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        {!revealAnswer ? (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Translate to English
              </h3>
              <p className="text-3xl font-semibold font-japanese mb-2">{vocabItem.japanese}</p>
              <p className="text-xl text-slate-600 dark:text-slate-300">{vocabItem.romaji}</p>
            </div>
            
            <div>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    checkAnswer();
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 ${answerCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-full p-1 ${answerCorrect ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}`}>
                  {answerCorrect ? 
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />}
                </div>
                <span className="ml-2 font-medium">
                  {answerCorrect ? 'Correct!' : 'Not quite right'}
                </span>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-3xl font-semibold font-japanese mb-1">{vocabItem.japanese}</p>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-1">{vocabItem.romaji}</p>
              <p className="text-lg text-slate-500 dark:text-slate-400">{vocabItem.hiragana}</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-medium text-nihongo-red">
                {vocabItem.english}
              </p>
            </div>
            
            {vocabItem.example_sentence && (
              <div className="text-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Example:</p>
                <p className="text-md font-japanese">{vocabItem.example_sentence}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {!revealAnswer ? (
        <Button 
          className="w-full py-6" 
          onClick={checkAnswer}
        >
          Check
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="py-5 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => onAnswer(false, 4)}
          >
            <X className="mr-2 h-5 w-5" />
            Hard
          </Button>
          <Button 
            className="py-5 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onAnswer(true, 2)}
          >
            <Check className="mr-2 h-5 w-5" />
            Easy
          </Button>
        </div>
      )}
      
      <div className="flex justify-between items-center text-sm text-slate-500 px-1">
        <div>
          {currentIndex + 1} of {totalItems}
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-3">
            <Check className="h-4 w-4 text-green-500 mr-1" />
            <span>{reviewStats.correct}</span>
          </div>
          <div className="flex items-center">
            <X className="h-4 w-4 text-red-500 mr-1" />
            <span>{reviewStats.incorrect}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
