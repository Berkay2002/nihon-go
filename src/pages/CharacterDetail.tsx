
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Volume2, Loader2, AlertCircle } from "lucide-react";
import contentService from "@/services/contentService";
import type { Hiragana } from "@/services/api/hiraganaService";
import type { Katakana } from "@/services/api/katakanaService";
import type { Kanji } from "@/services/api/kanjiService";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAudio } from "@/hooks/useAudio";
import { toast } from "sonner";

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
  const [audioError, setAudioError] = useState(false);
  
  const { speak, isPlaying, voicesLoaded } = useAudio({ 
    lang: 'ja-JP', 
    rate: 0.8, // Slightly slower for better pronunciation
  });

  // Effect to try preloading voice data when component mounts
  useEffect(() => {
    if (!voicesLoaded) {
      const checkVoicesInterval = setInterval(() => {
        // This triggers the browser to load voices
        if (window.speechSynthesis) {
          window.speechSynthesis.getVoices();
          if (window.speechSynthesis.getVoices().length > 0) {
            clearInterval(checkVoicesInterval);
            console.log("Voices successfully loaded");
          }
        }
      }, 300);
      
      // Clear interval after 5 seconds to prevent infinite checking
      setTimeout(() => clearInterval(checkVoicesInterval), 5000);
      
      return () => clearInterval(checkVoicesInterval);
    }
  }, [voicesLoaded]);

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

  const handlePlayPronunciation = () => {
    if (!character) return;
    
    try {
      console.log(`Attempting to speak: ${character.character}`);
      const success = speak(character.character);
      
      if (!success) {
        console.error("Speech synthesis failed");
        setAudioError(true);
        toast.error("Failed to play pronunciation. Your browser might not support this feature.");
        setTimeout(() => setAudioError(false), 2000);
      }
    } catch (error) {
      console.error("Error playing pronunciation:", error);
      setAudioError(true);
      toast.error("An error occurred while playing the pronunciation");
      setTimeout(() => setAudioError(false), 2000);
    }
  };

  const handlePlayExampleWord = () => {
    if (!character) return;
    
    try {
      console.log(`Attempting to speak example word: ${character.example_word}`);
      const success = speak(character.example_word);
      
      if (!success) {
        console.error("Speech synthesis failed for example word");
        toast.error("Failed to play example word pronunciation");
      }
    } catch (error) {
      console.error("Error playing example word:", error);
      toast.error("An error occurred while playing the example word");
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
        <div className="inline-block p-8 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4 relative">
          <span className="text-8xl font-japanese text-high-contrast">{character.character}</span>
          <Button 
            onClick={handlePlayPronunciation} 
            size="sm" 
            variant={audioError ? "destructive" : "default"}
            className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 flex items-center justify-center bg-blue-500 hover:bg-blue-600"
            disabled={isPlaying}
          >
            {isPlaying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : audioError ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
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
              <Button 
                size="sm" 
                variant="outline"
                onClick={handlePlayExampleWord}
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Volume2 className="h-3 w-3 mr-1" />
                )}
                Listen
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
