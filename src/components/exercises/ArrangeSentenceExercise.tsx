
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { ExerciseType } from "@/types/exercises";
import { normalizeJapaneseText } from "@/lib/utils";

interface ArrangeSentenceExerciseProps {
  exercise: ExerciseType;
  arrangedWords: string[];
  availableWords: string[];
  isAnswerChecked: boolean;
  onAddWord: (word: string, index: number) => void;
  onRemoveWord: (index: number) => void;
}

export const ArrangeSentenceExercise = ({
  exercise,
  arrangedWords,
  availableWords,
  isAnswerChecked,
  onAddWord,
  onRemoveWord,
}: ArrangeSentenceExerciseProps) => {
  // Extract just the Japanese characters from each word for comparison
  const extractJapaneseChars = (word: string): string => {
    // Extract characters inside parentheses if present
    const match = word.match(/^(.*?)\s*\(.*?\)$/);
    return match ? match[1].trim() : word.trim();
  };
  
  // Join arranged words, extracting only Japanese characters if words have romaji in parentheses
  const userAnswer = arrangedWords.map(extractJapaneseChars).join("");
  const correctAnswer = normalizeJapaneseText(exercise.correct_answer);
  
  // Check if the answer is correct
  const isCorrect = normalizeJapaneseText(userAnswer) === correctAnswer;

  return (
    <div className="space-y-4">
      {/* Area for arranged words */}
      <div className="min-h-16 p-4 border border-dashed rounded-lg border-gray-300 flex flex-wrap gap-2 mb-4">
        {arrangedWords.length > 0 ? (
          arrangedWords.map((word, index) => (
            <Button
              key={`arranged-${index}`}
              variant="outline"
              className="bg-nihongo-blue/10 hover:bg-nihongo-blue/15"
              onClick={() => onRemoveWord(index)}
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
            onClick={() => onAddWord(word, index)}
            disabled={isAnswerChecked}
          >
            {word}
          </Button>
        ))}
      </div>
      
      {isAnswerChecked && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium text-lg">
            {isCorrect
              ? <span className="flex items-center text-nihongo-green"><Check className="w-5 h-5 mr-2" /> Correct!</span>
              : <span className="flex items-center text-nihongo-error"><X className="w-5 h-5 mr-2" /> Incorrect</span>
            }
          </p>
          <p className="mt-2">
            Correct answer: <span className="font-medium">{exercise.correct_answer}</span>
          </p>
        </div>
      )}
    </div>
  );
};
