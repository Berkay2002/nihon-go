
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
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
  const { speak } = useAudio({ lang: 'ja-JP' });
  
  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    speak(character);
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
          variant="ghost" 
          className="absolute top-0 right-0 h-6 w-6 p-0"
          onClick={handlePronounce}
        >
          <Volume2 className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
};
