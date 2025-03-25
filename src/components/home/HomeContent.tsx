
import React from "react";
import { NavigateFunction } from "react-router-dom";
import { HomeHeader } from "./HomeHeader";
import { StatsSection } from "./StatsSection";
import { ContinueLearningSection } from "./ContinueLearningSection";
import { RecentLessonsSection } from "./RecentLessonsSection";
import { GuestMessage } from "@/components/shared/GuestMessage";

interface UserData {
  streak: number;
  level: number;
  xp: number;
  totalXp: number;
  dailyGoal: number;
  recentLessons: any[];
  nextLesson: {
    id: string;
    title: string;
    unitName: string;
    xp_reward: number;
  } | null;
}

interface HomeContentProps {
  username: string;
  userData: UserData;
  navigate: NavigateFunction;
}

export const HomeContent: React.FC<HomeContentProps> = ({
  username,
  userData,
  navigate,
}) => {
  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <HomeHeader username={username} />
      
      <StatsSection 
        streak={userData.streak} 
        level={userData.level} 
        totalXp={userData.totalXp}
        xp={userData.xp}
        dailyGoal={userData.dailyGoal}
      />

      <ContinueLearningSection 
        nextLesson={userData.nextLesson} 
        navigate={navigate} 
      />
      
      {userData.recentLessons.length > 0 && (
        <RecentLessonsSection 
          recentLessons={userData.recentLessons} 
          navigate={navigate} 
        />
      )}
    </div>
  );
};
