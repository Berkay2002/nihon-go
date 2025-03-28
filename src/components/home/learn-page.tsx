import React from "react";
import { Header } from "./header";
import { Unit } from "./unit";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Quests } from "@/components/quests";
import { DailyStreak } from "@/components/promo";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "@/lib/theme-provider";

type LearnPageProps = {
  units: Array<{
    id: string;
    title: string;
    description?: string;
    progress: number;
    lessons: Array<{
      id: string;
      title: string;
      isCompleted: boolean;
      isCurrent: boolean;
      isLocked: boolean;
      xpReward: number;
      type?: "standard" | "review" | "boss" | "treasure";
    }>;
  }>;
  activeLesson?: {
    id: string;
    unitId: string;
  };
  activeLessonPercentage?: number;
  streak?: number;
  totalXp?: number;
  onBack?: () => void;
  onSelectLesson: (lessonId: string) => void;
};

export const LearnPage: React.FC<LearnPageProps> = ({
  units,
  activeLesson,
  activeLessonPercentage = 0,
  streak = 0,
  totalXp = 0,
  onBack,
  onSelectLesson,
}) => {
  const { isDark } = useTheme();
  
  // Function to get unit color based on index
  const getUnitColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    return colors[index % colors.length];
  };

  // Create a mock active course object
  const activeCourse = {
    title: "Japanese",
    imageSrc: "/japan-flag.svg"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 px-4 md:px-10 lg:px-20 py-4 md:py-8 max-w-screen-xl mx-auto">
        {/* Main content - Learning Path */}
        <div className="w-full order-2 md:order-1">
          <FeedWrapper>            
            {units.map((unit, index) => (
              <Unit
                key={unit.id}
                id={unit.id}
                title={unit.title}
                description={unit.description}
                unitColor={getUnitColor(index)}
                lessons={unit.lessons}
                activeLesson={activeLesson}
                activeLessonPercentage={
                  activeLesson?.unitId === unit.id ? activeLessonPercentage : 0
                }
                onSelectLesson={onSelectLesson}
                onContinue={() => {
                  // Find first unlocked lesson
                  const firstUnlockedLesson = unit.lessons.find(
                    lesson => !lesson.isLocked && !lesson.isCompleted
                  );
                  if (firstUnlockedLesson) {
                    onSelectLesson(firstUnlockedLesson.id);
                  }
                }}
                index={index}
              />
            ))}
          </FeedWrapper>
        </div>
        
        {/* Sidebar */}
        {/*<div className="w-full md:w-1/3 lg:w-1/4 order-1 md:order-2 mb-4 md:mb-0">
          <StickyWrapper>
            {/* <UserProgress
              activeCourse={activeCourse}
              points={totalXp}
            />*/}
            
            {/* Comment out the DailyStreak component for now */}
            {/* 
            <DailyStreak currentStreak={streak} />
            */}
            
            {/* Comment out the Quests component for now */}
            {/*
            <Quests points={totalXp} />
            
          </StickyWrapper>
        </div>*/}
        
      </div>
    </div>
  );
}; 