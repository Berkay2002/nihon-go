
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";

interface CharacterCardProps {
  id: string;
  character: string;
  romaji: string;
  onClick: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  id,
  character,
  romaji,
  onClick,
}) => {
  const { speak, isPlaying } = useAudio({ lang: 'ja-JP' });
  const [audioError, setAudioError] = useState(false);
  
  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    try {
      const success = speak(character);
      if (!success) {
        console.error(`Failed to pronounce character: ${character}`);
        setAudioError(true);
        // Reset error state after a delay
        setTimeout(() => setAudioError(false), 2000);
      }
    } catch (err) {
      console.error("Error pronouncing character:", err);
      setAudioError(true);
      setTimeout(() => setAudioError(false), 2000);
    }
  };

  return (
    <Card 
      className="border hover:border-blue-500 hover:shadow-md transition-all cursor-pointer relative"
      onClick={onClick}
    >
      <CardContent className="p-2 text-center">
        <div className="text-2xl font-japanese mb-1 text-high-contrast">
          {character}
        </div>
        <div className="text-xs text-medium-contrast">
          {romaji}
        </div>
        <Button 
          size="sm" 
          variant={audioError ? "destructive" : "ghost"}
          className="absolute top-0 right-0 h-6 w-6 p-0"
          onClick={handlePronounce}
          disabled={isPlaying}
        >
          {isPlaying ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
