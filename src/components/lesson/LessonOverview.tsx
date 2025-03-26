
import React from 'react';
import { Lesson } from '@/services/contentService';
import { Clock, Zap, XCircle } from 'lucide-react';

interface LessonOverviewProps {
  lesson: Lesson;
  isCompleted?: boolean;
}

export const LessonOverview: React.FC<LessonOverviewProps> = ({ 
  lesson, 
  isCompleted = false 
}) => {
  return (
    <div className="mb-8 space-y-4">
      <p className="text-lg text-high-contrast">{lesson.description}</p>
      
      <div className="flex items-center gap-3 text-sm">
        <Clock className="h-5 w-5 text-medium-contrast" />
        <span className="text-medium-contrast">{lesson.estimated_time}</span>
      </div>
      
      <div className="flex items-center gap-3 text-sm">
        {isCompleted ? (
          <>
            <XCircle className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">0 XP (already completed)</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-yellow-500 font-medium">{lesson.xp_reward} XP</span>
          </>
        )}
      </div>
    </div>
  );
};
