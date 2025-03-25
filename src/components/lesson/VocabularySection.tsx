import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Vocabulary } from "@/services/contentService";

interface VocabularySectionProps {
  vocabulary: Vocabulary[];
}

export const VocabularySection: React.FC<VocabularySectionProps> = ({ vocabulary }) => {
  if (vocabulary.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">Vocabulary</h2>
      <div className="space-y-3">
        {vocabulary.map((word) => (
          <Card key={word.id} className="border border-nihongo-red/10 hover:border-nihongo-red/30 transition-colors">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Japanese</p>
                  <p className="text-lg font-semibold font-japanese">{word.japanese}</p>
                  <p className="text-xs text-muted-foreground mt-1">{word.romaji}</p>
                </div>
                <div className="border-l pl-4">
                  <p className="text-xs text-muted-foreground mb-1">English</p>
                  <p className="text-lg font-semibold">{word.english}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
