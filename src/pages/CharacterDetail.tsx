
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import contentService from "@/services/contentService";
import type { Hiragana } from "@/services/api/hiraganaService";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const CharacterDetail = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Hiragana | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!characterId) {
        setError("Character ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching character with ID:", characterId);
        const allCharacters = await contentService.getHiragana();
        console.log("All characters:", allCharacters);
        
        const foundCharacter = allCharacters.find(char => char.id === characterId);
        
        if (foundCharacter) {
          console.log("Found character:", foundCharacter);
          setCharacter(foundCharacter);
        } else {
          console.log("No character found with ID:", characterId);
          setError("Character not found");
        }
      } catch (err) {
        console.error("Error fetching hiragana character:", err);
        setError("Failed to load character details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId]);

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
        <Button variant="ghost" onClick={goBack} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-500">{error || "Character not found"}</p>
            <Button onClick={() => navigate("/app/characters")} className="mt-4">
              Return to Characters
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Characters
      </Button>
      
      <div className="text-center mb-8">
        <div className="inline-block p-8 rounded-full bg-blue-50 mb-4">
          <span className="text-8xl font-japanese">{character.character}</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">{character.romaji}</h1>
        <p className="text-muted-foreground">Hiragana</p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Stroke Order</h2>
            <p className="text-sm text-muted-foreground">{character.stroke_order}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Example Word</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-japanese mb-1">{character.example_word}</p>
                <p className="text-sm text-muted-foreground">{character.example_word_meaning}</p>
              </div>
              <Button size="sm" variant="outline">
                Practice
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Pronunciation Tips</h2>
            <p className="text-sm text-muted-foreground">
              {character.romaji === "a" && "Pronounced like the 'a' in 'father'."}
              {character.romaji === "i" && "Pronounced like the 'ee' in 'feet'."}
              {character.romaji === "u" && "Pronounced like the 'oo' in 'food', but shorter."}
              {character.romaji === "e" && "Pronounced like the 'e' in 'pet'."}
              {character.romaji === "o" && "Pronounced like the 'o' in 'note'."}
              {!["a", "i", "u", "e", "o"].includes(character.romaji) && 
                `Pronounced as ${character.romaji.charAt(0)} + ${character.romaji.charAt(1)}.`}
            </p>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8">
          <Button className="bg-blue-500 hover:bg-blue-600 w-full">
            Practice Writing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetail;
