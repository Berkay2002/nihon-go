// src/pages/LanguageLearningPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LearningPathway, { PathUnit } from "@/components/LearningPathway";
import UnitBannerCard from "@/components/UnitBannerCard";

const LanguageLearningPage = () => {
  const navigate = useNavigate();
  
  // Mock data for units and lessons
  const units: PathUnit[] = [
    {
      id: "unit-1",
      title: "Unit 1",
      description: "Learn the basics of Spanish",
      progress: 70,
      lessons: [
        { id: "1-1", isCompleted: true, isCurrent: false },
        { id: "1-2", isCompleted: true, isCurrent: false },
        { id: "1-3", isCompleted: false, isCurrent: true },
        { id: "1-4", isCompleted: false, isCurrent: false, isLocked: true },
        { id: "1-5", isCompleted: false, isCurrent: false, isLocked: true },
        { id: "1-6", isCompleted: false, isCurrent: false, isLocked: true },
        { id: "1-7", isCompleted: false, isCurrent: false, isLocked: true }
      ]
    },
    {
      id: "unit-2",
      title: "Unit 2",
      description: "Common phrases and expressions",
      progress: 0,
      lessons: [
        { id: "2-1", isCompleted: false, isCurrent: false, isLocked: true },
        { id: "2-2", isCompleted: false, isCurrent: false, isLocked: true },
        { id: "2-3", isCompleted: false, isCurrent: false, isLocked: true }
      ]
    }
  ];

  const handleSelectLesson = (lessonId: string) => {
    // Navigate to lesson page
    console.log("Selected lesson:", lessonId);
    // navigate(`/lesson/${lessonId}`);
  };

  const handleContinue = (unitId: string) => {
    console.log("Continue unit:", unitId);
    // Implement your continue logic here
  };

  return (
    <div className="bg-[#0A1019] min-h-screen text-white px-4 py-6">
      {/* Header with language, points, streak, and hearts */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-lg font-bold ml-2">Spanish</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* XP Points */}
          <div className="text-red-500">
            ⚡ 170
          </div>
          
          {/* Hearts */}
          <div className="text-red-500">
            ❤️ 5
          </div>
        </div>
      </div>
      
      {/* Units with Learning Paths */}
      <div className="max-w-md mx-auto">
        {units.map(unit => (
          <div key={unit.id} className="mb-10">
            <UnitBannerCard 
              title={unit.title}
              description={unit.description}
              onContinue={() => handleContinue(unit.id)}
            />
            
            <LearningPathway 
              unit={unit}
              onSelectLesson={handleSelectLesson}
            />
          </div>
        ))}
      </div>
      
      {/* Navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A1019] border-t border-gray-800 py-3 px-4">
        <div className="flex justify-around items-center">
          <div className="text-center text-white opacity-80">
            <span className="block text-xl">🏠</span>
            <span className="text-xs">Home</span>
          </div>
          <div className="text-center text-white">
            <span className="block text-xl">📚</span>
            <span className="text-xs">Lessons</span>
          </div>
          <div className="text-center text-white opacity-80">
            <span className="block text-xl">🏆</span>
            <span className="text-xs">Trophies</span>
          </div>
          <div className="text-center text-white opacity-80">
            <span className="block text-xl">👤</span>
            <span className="text-xs">Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageLearningPage;