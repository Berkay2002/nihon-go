
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { User, Book, Flame, Award, Settings, LogOut, Clock, Sun, Moon } from "lucide-react";

const Profile = () => {
  // Mock data - would come from API in real app
  const userData = {
    name: "User",
    email: "user@example.com",
    level: 3,
    xp: 285,
    xpToNextLevel: 400,
    streak: 5,
    longestStreak: 7,
    joinDate: "Aug 15, 2023",
    daysActive: 12,
    wordsLearned: 28,
    lessonsCompleted: 5,
    achievementsEarned: 2,
  };

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <header className="mb-8">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-nihongo-blue/10 flex items-center justify-center">
            <User className="w-12 h-12 text-nihongo-blue" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">{userData.name}</h1>
        <p className="text-muted-foreground text-center mb-4">{userData.email}</p>
        <div className="flex justify-center">
          <div className="flex items-center bg-nihongo-red/10 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-nihongo-red">Level {userData.level}</span>
          </div>
        </div>
      </header>

      <section className="mb-8">
        <Card className="border border-nihongo-blue/10 shadow-md mb-6">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">XP Progress</h2>
            <div className="mb-2 flex justify-between items-center text-sm">
              <span>Level {userData.level}</span>
              <span>Level {userData.level + 1}</span>
            </div>
            <Progress 
              value={(userData.xp / userData.xpToNextLevel) * 100} 
              className="h-2 mb-2 bg-gray-100" 
              indicatorClassName="bg-gradient-to-r from-nihongo-blue to-nihongo-red" 
            />
            <p className="text-xs text-center text-muted-foreground">
              {userData.xp}/{userData.xpToNextLevel} XP needed for next level
            </p>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-4">Learning Stats</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border border-nihongo-red/10 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-nihongo-red/10 flex items-center justify-center mb-2">
                <Flame className="w-5 h-5 text-nihongo-red" />
              </div>
              <span className="text-2xl font-bold">{userData.streak}</span>
              <span className="text-xs text-muted-foreground">Current Streak</span>
            </CardContent>
          </Card>
          <Card className="border border-nihongo-gold/10 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-nihongo-gold/10 flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-nihongo-gold" />
              </div>
              <span className="text-2xl font-bold">{userData.achievementsEarned}</span>
              <span className="text-xs text-muted-foreground">Achievements</span>
            </CardContent>
          </Card>
          <Card className="border border-nihongo-blue/10 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-nihongo-blue/10 flex items-center justify-center mb-2">
                <Book className="w-5 h-5 text-nihongo-blue" />
              </div>
              <span className="text-2xl font-bold">{userData.wordsLearned}</span>
              <span className="text-xs text-muted-foreground">Words Learned</span>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-2xl font-bold">{userData.daysActive}</span>
              <span className="text-xs text-muted-foreground">Days Active</span>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-muted-foreground mr-3" />
              <span>Theme</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-nihongo-blue">
                <Sun className="w-4 h-4 mr-1" />
                Light
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Moon className="w-4 h-4 mr-1" />
                Dark
              </Button>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full border-nihongo-error/30 text-nihongo-error hover:bg-nihongo-error/5 py-6"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Profile;
