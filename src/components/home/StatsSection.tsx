
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Zap, Trophy } from "lucide-react";

interface StatsSectionProps {
  streak: number;
  level: number;
  totalXp: number;
  xp: number;
  dailyGoal: number;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ 
  streak, level, totalXp, xp, dailyGoal 
}) => {
  const progressPercentage = Math.min(Math.round((xp / dailyGoal) * 100), 100);

  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="border border-nihongo-red/10">
          <CardContent className="flex flex-col items-center justify-center p-4 h-full">
            <div className="flex items-center justify-center w-12 h-12 bg-nihongo-red/10 rounded-full mb-2">
              <Flame className="w-6 h-6 text-nihongo-red" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Streak</p>
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
        
        <Card className="border border-nihongo-blue/10">
          <CardContent className="flex flex-col items-center justify-center p-4 h-full">
            <div className="flex items-center justify-center w-12 h-12 bg-nihongo-blue/10 rounded-full mb-2">
              <Zap className="w-6 h-6 text-nihongo-blue" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Level</p>
            <p className="text-2xl font-bold">{level}</p>
            <p className="text-xs text-muted-foreground">{totalXp} XP total</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border border-nihongo-gold/10 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-nihongo-gold/10 rounded-full mr-3">
                <Trophy className="w-5 h-5 text-nihongo-gold" />
              </div>
              <div>
                <p className="font-semibold">Daily Goal</p>
                <p className="text-xs text-muted-foreground">{xp}/{dailyGoal} XP today</p>
              </div>
            </div>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-gray-100" 
            indicatorClassName="bg-nihongo-gold" 
          />
        </CardContent>
      </Card>
    </section>
  );
};
