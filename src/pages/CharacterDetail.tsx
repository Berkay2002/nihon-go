
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import contentService from "@/services/contentService";
import type { Hiragana } from "@/services/api/hiraganaService";
import type { Katakana } from "@/services/api/katakanaService";
import type { Kanji } from "@/services/api/kanjiService";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

type CharacterType = Hiragana | Katakana | Kanji;

const CharacterDetail = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const characterType = searchParams.get('type') || 'hiragana';
  
  const [character, setCharacter] = useState<CharacterType | null>(null);
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
        console.log(`Fetching ${characterType} character with ID:`, characterId);
        
        let allCharacters: CharacterType[] = [];
        
        // Get characters based on type
        switch(characterType) {
          case 'hiragana':
            allCharacters = await contentService.getHiragana();
            break;
          case 'katakana':
            allCharacters = await contentService.getKatakana();
            break;
          case 'kanji':
            allCharacters = await contentService.getKanji();
            break;
          default:
            allCharacters = await contentService.getHiragana();
        }
        
        console.log("All characters:", allCharacters);
        
        const foundCharacter = allCharacters.find(char => char.id === characterId);
        
        if (foundCharacter) {
          console.log("Found character:", foundCharacter);
          setCharacter(foundCharacter);
        } else {
          console.log(`No ${characterType} character found with ID:`, characterId);
          setError("Character not found");
        }
      } catch (err) {
        console.error(`Error fetching ${characterType} character:`, err);
        setError("Failed to load character details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId, characterType]);

  const getCharacterTypeLabel = () => {
    switch(characterType) {
      case 'hiragana': return 'Hiragana';
      case 'katakana': return 'Katakana';
      case 'kanji': return 'Kanji';
      default: return 'Character';
    }
  };

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
        <div className="inline-block p-8 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
          <span className="text-8xl font-japanese text-high-contrast">{character.character}</span>
        </div>
        <h1 className="text-2xl font-bold mb-1 text-high-contrast">{character.romaji}</h1>
        <p className="text-medium-contrast">{getCharacterTypeLabel()}</p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 text-medium-contrast">Stroke Order</h2>
            <p className="text-sm text-high-contrast">{character.stroke_order}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 text-medium-contrast">Example Word</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-japanese mb-1 text-high-contrast">{character.example_word}</p>
                <p className="text-sm text-medium-contrast">{character.example_word_meaning}</p>
              </div>
              <Button size="sm" variant="outline">
                Practice
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 text-medium-contrast">Pronunciation Tips</h2>
            <p className="text-sm text-high-contrast">
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
          <Button className="bg-blue-500 hover:bg-blue-600 w-full text-white">
            Practice Writing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetail;
