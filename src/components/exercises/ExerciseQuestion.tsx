
import { Card, CardContent } from "@/components/ui/card";
import { ExerciseType } from "@/types/exercises";
import { MultipleChoiceExercise } from "./MultipleChoiceExercise";
import { TextInputExercise } from "./TextInputExercise";
import { ArrangeSentenceExercise } from "./ArrangeSentenceExercise";
import { TranslationExercise } from "./TranslationExercise";

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

export const ExerciseQuestion = ({
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
}: ExerciseQuestionProps) => {
  return (
    <Card className="border border-nihongo-blue/10 shadow-md mb-8">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{exercise.question}</h2>
          {exercise.romaji && (
            <div className="text-sm text-gray-600 mb-4">
              <span className="font-medium">{exercise.romaji}</span> <span className="text-xs italic">(pronunciation)</span>
            </div>
          )}
        </div>
        
        {exercise.type === "multiple_choice" && (
          <MultipleChoiceExercise
            exercise={exercise}
            selectedAnswer={selectedAnswer}
            isAnswerChecked={isAnswerChecked}
            onSelectAnswer={onSelectAnswer}
          />
        )}

        {exercise.type === "text_input" && (
          <TextInputExercise
            exercise={exercise}
            textAnswer={textAnswer}
            isAnswerChecked={isAnswerChecked}
            onTextAnswerChange={onTextAnswerChange}
          />
        )}

        {exercise.type === "arrange_sentence" && (
          <ArrangeSentenceExercise
            exercise={exercise}
            arrangedWords={arrangedWords}
            availableWords={availableWords}
            isAnswerChecked={isAnswerChecked}
            onAddWord={onAddWord}
            onRemoveWord={onRemoveWord}
          />
        )}

        {exercise.type === "translation" && (
          <TranslationExercise
            exercise={exercise}
            selectedAnswer={selectedAnswer}
            isAnswerChecked={isAnswerChecked}
            onSelectAnswer={onSelectAnswer}
          />
        )}
      </CardContent>
    </Card>
  );
};
