import React from "react";
import { LearningPath } from "./LearningPath";
import { GameCharacter } from "./GameCharacter";
import { UserProgressData } from "@/types/user";
import { LessonData } from "@/types/lesson";
import { Button } from "@/components/ui/button";

export interface HomeContentProps {
  userProgress: UserProgressData;
  recentLessons: LessonData[];
  streak: number;
  totalXp: number;
  onSelectUnit: (unitId: string) => void;
  onSelectLesson: (lessonId: string) => void;
}

export const HomeContent: React.FC<HomeContentProps> = ({
  userProgress,
  recentLessons,
  streak,
  totalXp,
  onSelectUnit,
  onSelectLesson,
}) => {
  const isMobile = window.innerWidth < 768;

  // Transform user progress into units/lessons format for LearningPath
  const units = userProgress.units.map(unit => ({
    id: unit.id,
    title: unit.title,
    progress: unit.progress,
    lessons: unit.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title, 
      isCompleted: lesson.isCompleted,
      isCurrent: lesson.isCurrent,
      isLocked: lesson.isLocked,
      xpReward: lesson.xpReward || 10,
      type: lesson.type || "standard"
    }))
  }));

  const characterState = streak > 5 ? "happy" : streak > 0 ? "idle" : "thinking";

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto pb-20">
      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <GameCharacter state={characterState} />
          <div>
            <p className="text-sm text-gray-500">Welcome back!</p>
            <h2 className="text-xl font-bold">Continue your journey</h2>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Streak</p>
            <p className="text-xl font-bold flex items-center">
              <span className="mr-1">🔥</span> {streak} {streak === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">XP Total</p>
            <p className="text-xl font-bold flex items-center">
              <span className="mr-1">⭐</span> {totalXp}
            </p>
          </div>
        </div>
      </div>

      {/* Learning Path Section */}
      <div className="flex-1">
        <div className={`relative ${isMobile ? 'px-2' : 'px-4'}`}>
          <LearningPath 
            units={units} 
            onSelectLesson={onSelectLesson}
          />
        </div>
      </div>

      {/* Quick Actions */}
      {isMobile ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-lg flex justify-around z-10">
          <Button variant="ghost" className="flex flex-col items-center" onClick={() => {}}>
            <span className="text-2xl">🏠</span>
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center" onClick={() => {}}>
            <span className="text-2xl">📚</span>
            <span className="text-xs">Units</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center" onClick={() => {}}>
            <span className="text-2xl">👤</span>
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      ) : null}
    </div>
  );
};
