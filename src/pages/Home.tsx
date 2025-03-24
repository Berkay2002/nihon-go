
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, BookOpen, ChevronRight, Award, Zap } from "lucide-react";
import StreakCounter from "@/components/StreakCounter";

const Home = () => {
  const navigate = useNavigate();
  
  // Mock data - would come from user state/API in real app
  const userData = {
    name: "User",
    level: 3,
    xp: 285,
    xpToNextLevel: 400,
    streak: 5,
    dailyGoal: 50,
    dailyXP: 30,
    currentLesson: {
      id: "1",
      title: "Greetings",
      unitName: "Basics",
      progress: 40,
    },
  };

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Let's continue learning Japanese</p>
        </div>
        <StreakCounter streak={userData.streak} />
      </header>

      <section className="mb-8">
        <Card className="mb-4 overflow-hidden border border-nihongo-blue/10 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-nihongo-blue/10 flex items-center justify-center mr-3">
                  <Zap className="w-5 h-5 text-nihongo-blue" />
                </div>
                <div>
                  <h3 className="font-semibold">Level {userData.level}</h3>
                  <p className="text-sm text-muted-foreground">
                    {userData.xp}/{userData.xpToNextLevel} XP
                  </p>
                </div>
              </div>
              <Award className="w-6 h-6 text-nihongo-gold animate-pulse-scale" />
            </div>
            <Progress value={(userData.xp / userData.xpToNextLevel) * 100} className="h-2 bg-gray-100" indicatorClassName="bg-gradient-to-r from-nihongo-blue to-nihongo-red" />
          </CardContent>
        </Card>

        <Card className="border border-nihongo-red/10 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate(`/app/lesson/${userData.currentLesson.id}`)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-nihongo-red/10 flex items-center justify-center mr-3">
                  <BookOpen className="w-6 h-6 text-nihongo-red" />
                </div>
                <div>
                  <h3 className="font-semibold">{userData.currentLesson.title}</h3>
                  <p className="text-sm text-muted-foreground">{userData.currentLesson.unitName}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-nihongo-red" />
            </div>
            <Progress value={userData.currentLesson.progress} className="h-2 bg-gray-100" indicatorClassName="bg-nihongo-red" />
            <div className="mt-4">
              <Button className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Daily Goal</h2>
        <Card className="border border-nihongo-gold/10 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold">Today's XP</h3>
                <p className="text-sm text-muted-foreground">
                  {userData.dailyXP}/{userData.dailyGoal} XP
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-nihongo-gold/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-nihongo-gold" />
              </div>
            </div>
            <Progress value={(userData.dailyXP / userData.dailyGoal) * 100} className="h-2 bg-gray-100" indicatorClassName="bg-nihongo-gold" />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Practice Skills</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-4 border-nihongo-blue/20 hover:border-nihongo-blue/50 hover:bg-nihongo-blue/5"
            onClick={() => navigate("/app/units")}
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-nihongo-blue/10 flex items-center justify-center mb-2">
                <span className="text-xl font-japanese font-bold text-nihongo-blue">あ</span>
              </div>
              <span>Hiragana</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 border-nihongo-red/20 hover:border-nihongo-red/50 hover:bg-nihongo-red/5"
            onClick={() => navigate("/app/units")}
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-nihongo-red/10 flex items-center justify-center mb-2">
                <span className="text-lg font-japanese font-bold text-nihongo-red">漢字</span>
              </div>
              <span>Kanji</span>
            </div>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
