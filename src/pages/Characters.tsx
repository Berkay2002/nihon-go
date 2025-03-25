import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import contentService from "@/services/contentService";
import type { Hiragana } from "@/services/api/hiraganaService";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const Characters = () => {
  const [activeTab, setActiveTab] = useState("hiragana");
  const [hiraganaChars, setHiraganaChars] = useState<Hiragana[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHiragana = async () => {
      try {
        setLoading(true);
        const data = await contentService.getHiragana();
        setHiraganaChars(data);
      } catch (err) {
        setError("Failed to load characters. Please try again later.");
        console.error("Error fetching hiragana:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHiragana();
  }, []);

  // Group the hiragana characters by their group_name
  const hiraganaGroups = hiraganaChars.reduce<Record<string, Hiragana[]>>((acc, char) => {
    if (!acc[char.group_name]) {
      acc[char.group_name] = [];
    }
    acc[char.group_name].push(char);
    return acc;
  }, {});

  const handleCharacterClick = (characterId: string) => {
    navigate(`/app/characters/${characterId}`);
  };

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
      <h1 className="text-2xl font-bold mb-6 text-center">Japanese Characters</h1>

      <Tabs defaultValue="hiragana" onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hiragana" className="text-base">HIRAGANA</TabsTrigger>
          <TabsTrigger value="katakana" className="text-base" disabled>KATAKANA</TabsTrigger>
          <TabsTrigger value="kanji" className="text-base" disabled>KANJI</TabsTrigger>
        </TabsList>

        <TabsContent value="hiragana" className="mt-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-2">Let's learn Hiragana!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Get to know the main writing system in Japanese
            </p>
            <div className="mb-4">
              <Button variant="outline" className="w-full mb-4">
                TIPS
              </Button>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                LEARN THE CHARACTERS
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center my-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-red-50 rounded-lg text-red-500">
              {error}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(hiraganaGroups).map(([groupName, chars]) => (
                <div key={groupName} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                    {groupName.charAt(0).toUpperCase() + groupName.slice(1)} Row
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {chars.map((char) => (
                      <Card 
                        key={char.id}
                        className="border hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleCharacterClick(char.id)}
                      >
                        <CardContent className="p-2 text-center">
                          <div className="text-2xl font-japanese mb-1">
                            {char.character}
                          </div>
                          <div className="text-xs text-gray-500">
                            {char.romaji}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="katakana" className="mt-6">
          <div className="text-center p-12 bg-gray-50 rounded-lg">
            <p className="text-lg font-medium mb-2">Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Katakana learning will be available in a future update
            </p>
          </div>
        </TabsContent>

        <TabsContent value="kanji" className="mt-6">
          <div className="text-center p-12 bg-gray-50 rounded-lg">
            <p className="text-lg font-medium mb-2">Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Kanji learning will be available in a future update
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Characters; 