
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Book, Star, Zap, Award } from "lucide-react";

const Achievements = () => {
  // Mock data - would come from API in real app
  const achievements = [
    {
      id: "1",
      name: "First Steps",
      description: "Complete your first lesson",
      icon: Book,
      isCompleted: true,
      progress: 100,
      xpReward: 10,
    },
    {
      id: "2",
      name: "3-Day Streak",
      description: "Maintain your streak for 3 days",
      icon: Flame,
      isCompleted: true,
      progress: 100,
      xpReward: 15,
    },
    {
      id: "3",
      name: "7-Day Streak",
      description: "Maintain your streak for 7 days",
      icon: Flame,
      isCompleted: false,
      progress: 71, // 5/7 days
      xpReward: 30,
    },
    {
      id: "4",
      name: "Perfect Lesson",
      description: "Complete a lesson with 100% accuracy",
      icon: Star,
      isCompleted: false,
      progress: 85,
      xpReward: 20,
    },
    {
      id: "5",
      name: "Vocabulary Builder",
      description: "Learn 10 new words",
      icon: Book,
      isCompleted: false,
      progress: 40, // 4/10 words
      xpReward: 25,
    },
    {
      id: "6",
      name: "Hiragana Hero",
      description: "Master all hiragana characters",
      icon: Award,
      isCompleted: false,
      progress: 20, // 9/46 characters
      xpReward: 50,
    },
  ];

  // Group achievements by completion status
  const completedAchievements = achievements.filter(a => a.isCompleted);
  const inProgressAchievements = achievements.filter(a => !a.isCompleted);

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <header className="mb-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-nihongo-gold/10 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-nihongo-gold" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Achievements</h1>
        <p className="text-muted-foreground text-center">Track your progress and earn rewards</p>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">In Progress</h2>
        <div className="space-y-4">
          {inProgressAchievements.map((achievement) => (
            <Card key={achievement.id} className="border border-nihongo-blue/10 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-nihongo-blue/10 flex items-center justify-center mr-4 mt-1">
                    <achievement.icon className="w-6 h-6 text-nihongo-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <div className="flex items-center bg-nihongo-red/10 px-2 py-0.5 rounded-full">
                        <Zap className="w-3 h-3 text-nihongo-red mr-0.5" />
                        <span className="text-xs font-medium text-nihongo-red">{achievement.xpReward}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <Progress 
                        value={achievement.progress} 
                        className="h-1.5 flex-1 mr-3 bg-gray-100" 
                        indicatorClassName="bg-nihongo-blue" 
                      />
                      <span className="text-xs font-medium">{achievement.progress}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Completed</h2>
        <div className="space-y-4">
          {completedAchievements.map((achievement) => (
            <Card key={achievement.id} className="border border-nihongo-green/20 bg-nihongo-green/5 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-nihongo-green/10 flex items-center justify-center mr-4 mt-1">
                    <achievement.icon className="w-6 h-6 text-nihongo-green" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-nihongo-gold">
                        <Star className="w-3 h-3 mr-1 fill-nihongo-gold text-nihongo-gold" />
                        Claimed
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Achievements;
