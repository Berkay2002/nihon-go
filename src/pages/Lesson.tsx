
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, BookOpen, Zap } from "lucide-react";

const Lesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();

  // Mock data - would come from API in real app
  const lessons = {
    "1": {
      id: "1",
      title: "Introduction",
      unitName: "Basics",
      description: "Let's learn how to introduce yourself in Japanese.",
      xpReward: 10,
      estimatedTime: "5 min",
      exercises: 5,
      vocabulary: [
        { japanese: "こんにちは", romaji: "konnichiwa", english: "Hello" },
        { japanese: "はじめまして", romaji: "hajimemashite", english: "Nice to meet you" },
        { japanese: "私", romaji: "watashi", english: "I/me" },
        { japanese: "です", romaji: "desu", english: "am/is" },
      ],
    },
    "6": {
      id: "6",
      title: "Hello & Goodbye",
      unitName: "Greetings",
      description: "Learn essential greetings for different times of day.",
      xpReward: 15,
      estimatedTime: "5 min",
      exercises: 6,
      vocabulary: [
        { japanese: "おはよう", romaji: "ohayou", english: "Good morning" },
        { japanese: "こんにちは", romaji: "konnichiwa", english: "Good afternoon" },
        { japanese: "こんばんは", romaji: "konbanwa", english: "Good evening" },
        { japanese: "さようなら", romaji: "sayounara", english: "Goodbye" },
        { japanese: "またね", romaji: "matane", english: "See you later" },
      ],
    },
  };

  const currentLesson = lessons[lessonId as keyof typeof lessons];

  if (!currentLesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <header className="mb-6">
        <Button variant="ghost" className="p-0 h-auto mb-4" onClick={() => navigate('/app/units')}>
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Back to Units</span>
        </Button>
        <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
        <p className="text-muted-foreground">{currentLesson.unitName}</p>
      </header>

      <section className="mb-8">
        <Card className="border border-nihongo-blue/10 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-nihongo-blue/10 flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-nihongo-blue" />
                </div>
                <div>
                  <h3 className="font-semibold">Overview</h3>
                  <p className="text-xs text-muted-foreground">{currentLesson.estimatedTime} · {currentLesson.exercises} exercises</p>
                </div>
              </div>
              <div className="flex items-center bg-nihongo-red/10 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4 text-nihongo-red mr-1" />
                <span className="text-xs font-medium text-nihongo-red">{currentLesson.xpReward} XP</span>
              </div>
            </div>
            <p className="text-sm mb-4">{currentLesson.description}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Vocabulary</h2>
        <div className="space-y-3">
          {currentLesson.vocabulary.map((word, index) => (
            <Card key={index} className="border border-nihongo-red/10 hover:border-nihongo-red/30 transition-colors">
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

      <Button 
        className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        onClick={() => navigate(`/app/exercise/1`)}
      >
        Start Lesson
      </Button>
    </div>
  );
};

export default Lesson;
