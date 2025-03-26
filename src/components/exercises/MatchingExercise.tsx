import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExerciseType } from "@/types/exercises";
import { Check, X, Volume2, Loader2 } from "lucide-react";
import { shuffleArray } from "@/lib/utils";
import { useAudio } from "@/hooks/useAudio";

interface MatchingExerciseProps {
  exercise: ExerciseType;
  isAnswerChecked: boolean;
  onAnswerCheck: (isCorrect: boolean) => void;
  audioEnabled?: boolean;
}

export const MatchingExercise = ({
  exercise,
  isAnswerChecked,
  onAnswerCheck,
  audioEnabled = false,
}: MatchingExerciseProps) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Map<string, string>>(new Map());
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const { speak, isPlaying } = useAudio({ lang: 'ja-JP' });

  // Initialize the matching exercise
  useEffect(() => {
    // If matching_pairs is defined, use it
    if (exercise.matching_pairs && exercise.matching_pairs.length > 0) {
      const hiragana = exercise.matching_pairs.map(pair => pair.hiragana);
      const romaji = exercise.matching_pairs.map(pair => pair.romaji);
      
      // Shuffle both arrays
      setLeftItems(shuffleArray([...hiragana]));
      setRightItems(shuffleArray([...romaji]));
      return;
    }
    
    // Fallback: Parse from options and correct_answer
    try {
      // Assume options contains hiragana and correct_answer format is "hiragana1:romaji1,hiragana2:romaji2"
      const pairs = exercise.correct_answer.split(',').map(pair => {
        const [hiragana, romaji] = pair.split(':');
        return { hiragana: hiragana.trim(), romaji: romaji.trim() };
      });
      
      const hiragana = pairs.map(pair => pair.hiragana);
      const romaji = pairs.map(pair => pair.romaji);
      
      setLeftItems(shuffleArray([...hiragana]));
      setRightItems(shuffleArray([...romaji]));
    } catch (error) {
      console.error("Error parsing matching exercise data:", error);
      // Fallback to options array if parsing fails
      if (Array.isArray(exercise.options) && exercise.options.length >= 2) {
        const midpoint = Math.floor(exercise.options.length / 2);
        const left = exercise.options.slice(0, midpoint);
        const right = exercise.options.slice(midpoint);
        
        setLeftItems(shuffleArray([...left]));
        setRightItems(shuffleArray([...right]));
      }
    }
  }, [exercise]);

  // Check if all matches are correct when answer is checked
  useEffect(() => {
    if (isAnswerChecked) {
      checkAllMatches();
    }
  }, [isAnswerChecked]);

  const handleLeftSelect = (item: string) => {
    if (isAnswerChecked) return;
    
    setSelectedLeft(item);
    
    // If right is already selected, try to make a match
    if (selectedRight) {
      const newMatches = new Map(matches);
      newMatches.set(item, selectedRight);
      setMatches(newMatches);
      
      // Reset selections
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleRightSelect = (item: string) => {
    if (isAnswerChecked) return;
    
    setSelectedRight(item);
    
    // If left is already selected, try to make a match
    if (selectedLeft) {
      const newMatches = new Map(matches);
      newMatches.set(selectedLeft, item);
      setMatches(newMatches);
      
      // Reset selections
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const removeMatch = (leftItem: string) => {
    if (isAnswerChecked) return;
    
    const newMatches = new Map(matches);
    newMatches.delete(leftItem);
    setMatches(newMatches);
  };

  const checkAllMatches = () => {
    let allCorrect = true;
    
    // Check if each match is correct based on matching_pairs
    if (exercise.matching_pairs) {
      const correctPairs = new Map(
        exercise.matching_pairs.map(pair => [pair.hiragana, pair.romaji])
      );
      
      // Check each match
      matches.forEach((rightValue, leftKey) => {
        if (correctPairs.get(leftKey) !== rightValue) {
          allCorrect = false;
        }
      });
      
      // Also check if all pairs are matched
      if (matches.size !== exercise.matching_pairs.length) {
        allCorrect = false;
      }
    } else if (exercise.correct_answer) {
      // Parse correct answer string (format: "hiragana1:romaji1,hiragana2:romaji2")
      try {
        const correctPairs = new Map();
        exercise.correct_answer.split(',').forEach(pair => {
          const [hiragana, romaji] = pair.split(':');
          correctPairs.set(hiragana.trim(), romaji.trim());
        });
        
        // Check each match
        matches.forEach((rightValue, leftKey) => {
          if (correctPairs.get(leftKey) !== rightValue) {
            allCorrect = false;
          }
        });
        
        // Also check if all pairs are matched
        if (matches.size !== correctPairs.size) {
          allCorrect = false;
        }
      } catch (error) {
        allCorrect = false;
      }
    }
    
    setIsCorrect(allCorrect);
    onAnswerCheck(allCorrect);
  };

  // Function to pronounce hiragana
  const handlePronounce = (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when clicking audio button
    speak(text);
  };

  // Filter out items that are already matched
  const availableLeftItems = leftItems.filter(item => !matches.has(item));
  const availableRightItems = rightItems.filter(item => !Array.from(matches.values()).includes(item));

  return (
    <div className="space-y-6">
      {/* Matched pairs */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-slate-700 dark:text-slate-300">Matched Pairs</h3>
        {matches.size > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {Array.from(matches.entries()).map(([leftItem, rightItem]) => (
              <div 
                key={leftItem} 
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    <span className="text-lg font-medium">{leftItem}</span>
                    {audioEnabled && (
                      <button
                        onClick={(e) => handlePronounce(leftItem, e)}
                        disabled={isPlaying}
                        className="ml-1 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {isPlaying ? (
                          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                        ) : (
                          <Volume2 className="h-3 w-3 text-blue-500" />
                        )}
                      </button>
                    )}
                  </div>
                  <span className="text-slate-500">→</span>
                  <span className="text-lg font-medium ml-2">{rightItem}</span>
                </div>
                {!isAnswerChecked && (
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-slate-500"
                    onClick={() => removeMatch(leftItem)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {isAnswerChecked && (
                  <div className="flex items-center">
                    {isCorrect ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400">Select items from both columns to create matches</p>
          </div>
        )}
      </div>

      {/* Selection areas */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left column - Hiragana */}
        <div className="space-y-3">
          <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 text-center">Hiragana</h3>
          <div className="flex flex-col gap-2">
            {availableLeftItems.map(item => (
              <Button
                key={item}
                variant={selectedLeft === item ? "default" : "outline"}
                className={`${selectedLeft === item ? "bg-blue-500" : ""} justify-between group`}
                onClick={() => handleLeftSelect(item)}
                disabled={isAnswerChecked}
              >
                <span>{item}</span>
                {audioEnabled && (
                  <button
                    onClick={(e) => handlePronounce(item, e)}
                    disabled={isPlaying}
                    className="opacity-0 group-hover:opacity-100 ml-1 p-1 rounded-full transition-opacity"
                  >
                    {isPlaying ? (
                      <Loader2 className="h-3 w-3 animate-spin text-white" />
                    ) : (
                      <Volume2 className="h-3 w-3 text-white" />
                    )}
                  </button>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Right column - Romaji */}
        <div className="space-y-3">
          <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 text-center">Romaji</h3>
          <div className="flex flex-col gap-2">
            {availableRightItems.map(item => (
              <Button
                key={item}
                variant={selectedRight === item ? "default" : "outline"}
                className={selectedRight === item ? "bg-blue-500" : ""}
                onClick={() => handleRightSelect(item)}
                disabled={isAnswerChecked}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isAnswerChecked && !isCorrect && (
        <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Correct matches:</p>
          <div className="space-y-2">
            {exercise.matching_pairs ? (
              exercise.matching_pairs.map(pair => (
                <p key={pair.hiragana} className="font-medium">
                  {pair.hiragana} → {pair.romaji}
                </p>
              ))
            ) : (
              exercise.correct_answer.split(',').map(pair => {
                const [hiragana, romaji] = pair.split(':');
                return (
                  <p key={hiragana} className="font-medium">
                    {hiragana.trim()} → {romaji.trim()}
                  </p>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 