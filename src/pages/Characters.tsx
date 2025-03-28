import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import contentService from "@/services/contentService";
import type { Hiragana } from "@/services/api/hiraganaService";
import type { Katakana } from "@/services/api/katakanaService";
import type { Kanji } from "@/services/api/kanjiService";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/units/Messages";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { useAudio } from "@/hooks/useAudio";

const Characters = () => {
  const [activeTab, setActiveTab] = useState("hiragana");
  const [hiraganaChars, setHiraganaChars] = useState<Hiragana[]>([]);
  const [katakanaChars, setKatakanaChars] = useState<Katakana[]>([]);
  const [kanjiChars, setKanjiChars] = useState<Kanji[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { preloadVoices } = useAudio();

  // Preload voices
  useEffect(() => {
    preloadVoices();
  }, [preloadVoices]);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all character types
      const [hiragana, katakana, kanji] = await Promise.all([
        contentService.getHiragana(),
        contentService.getKatakana(),
        contentService.getKanji()
      ]);
      
      console.log("Received hiragana characters:", hiragana);
      console.log("Received katakana characters:", katakana);
      console.log("Received kanji characters:", kanji);
      
      setHiraganaChars(hiragana);
      setKatakanaChars(katakana);
      setKanjiChars(kanji);
    } catch (err) {
      console.error("Error fetching characters:", err);
      setError("Failed to load characters. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  // Group the characters by their group_name
  const hiraganaGroups = hiraganaChars.reduce<Record<string, Hiragana[]>>((acc, char) => {
    if (!acc[char.group_name]) {
      acc[char.group_name] = [];
    }
    acc[char.group_name].push(char);
    return acc;
  }, {});

  const katakanaGroups = katakanaChars.reduce<Record<string, Katakana[]>>((acc, char) => {
    if (!acc[char.group_name]) {
      acc[char.group_name] = [];
    }
    acc[char.group_name].push(char);
    return acc;
  }, {});

  const kanjiGroups = kanjiChars.reduce<Record<string, Kanji[]>>((acc, char) => {
    if (!acc[char.group_name]) {
      acc[char.group_name] = [];
    }
    acc[char.group_name].push(char);
    return acc;
  }, {});

  const handleCharacterClick = (characterId: string, type: string) => {
    console.log(`Navigating to ${type} character:`, characterId);
    navigate(`/app/characters/${characterId}?type=${type}`);
  };

  // Render a character group section
  const renderCharacterGroup = (
    groupName: string, 
    chars: (Hiragana | Katakana | Kanji)[], 
    type: string
  ) => (
    <div key={groupName} className="mb-8">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-medium-contrast">
        {groupName.charAt(0).toUpperCase() + groupName.slice(1)} {type === 'kanji' ? 'Group' : 'Row'}
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {chars.map((char) => (
          <CharacterCard
            key={char.id}
            id={char.id}
            character={char.character}
            romaji={char.romaji}
            onClick={() => handleCharacterClick(char.id, type)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
      <h1 className="text-2xl font-bold mb-6 text-center text-high-contrast">Japanese Characters</h1>

      <Tabs defaultValue="hiragana" onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 bg-background">
          <TabsTrigger value="hiragana" className="text-base">HIRAGANA</TabsTrigger>
          <TabsTrigger value="katakana" className="text-base">KATAKANA</TabsTrigger>
          <TabsTrigger value="kanji" className="text-base">KANJI</TabsTrigger>
        </TabsList>

        {/* Hiragana Tab Content */}
        <TabsContent value="hiragana" className="mt-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-2 text-high-contrast">Let's learn Hiragana!</h2>
            <p className="text-sm text-medium-contrast mb-6">
              Get to know the main writing system in Japanese
            </p>
            <div className="mb-4">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                LEARN THE CHARACTERS
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center my-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <ErrorMessage error={error} onRetry={fetchCharacters} />
          ) : (
            <div className="space-y-8">
              {Object.entries(hiraganaGroups).map(([groupName, chars]) => 
                renderCharacterGroup(groupName, chars, 'hiragana')
              )}
            </div>
          )}
        </TabsContent>

        {/* Katakana Tab Content */}
        <TabsContent value="katakana" className="mt-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-2 text-high-contrast">Let's learn Katakana!</h2>
            <p className="text-sm text-medium-contrast mb-6">
              Essential for writing foreign words in Japanese
            </p>
            <div className="mb-4">
              <Button variant="outline" className="w-full mb-4">
                TIPS
              </Button>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                LEARN THE CHARACTERS
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center my-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <ErrorMessage error={error} onRetry={fetchCharacters} />
          ) : katakanaChars.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 dark:bg-slate-800/30 rounded-lg">
              <p className="text-lg font-medium mb-2 text-high-contrast">No Katakana Characters</p>
              <p className="text-sm text-medium-contrast">
                Katakana characters will be available soon.
              </p>
              <Button onClick={fetchCharacters} className="mt-4">
                Retry Loading
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(katakanaGroups).map(([groupName, chars]) => 
                renderCharacterGroup(groupName, chars, 'katakana')
              )}
            </div>
          )}
        </TabsContent>

        {/* Kanji Tab Content */}
        <TabsContent value="kanji" className="mt-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-2 text-high-contrast">Let's learn Kanji!</h2>
            <p className="text-sm text-medium-contrast mb-6">
              Chinese characters used in Japanese writing
            </p>
            <div className="mb-4">
              <Button variant="outline" className="w-full mb-4">
                TIPS
              </Button>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                LEARN THE CHARACTERS
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center my-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <ErrorMessage error={error} onRetry={fetchCharacters} />
          ) : kanjiChars.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 dark:bg-slate-800/30 rounded-lg">
              <p className="text-lg font-medium mb-2 text-high-contrast">No Kanji Characters</p>
              <p className="text-sm text-medium-contrast">
                Kanji characters will be available soon.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(kanjiGroups).map(([groupName, chars]) => 
                renderCharacterGroup(groupName, chars, 'kanji')
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Characters;
