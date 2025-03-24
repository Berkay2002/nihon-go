
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LessonCard, LessonCardSkeleton } from "./LessonCard";
import { NavigateFunction } from "react-router-dom";

interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: string;
  xp_reward: number;
  is_completed?: boolean;
  is_locked?: boolean;
}

interface LessonsListProps {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  isGuest: boolean;
  navigate: NavigateFunction;
  handleLessonClick: (lesson: Lesson) => void;
}

export const LessonsList: React.FC<LessonsListProps> = ({
  lessons,
  loading,
  error,
  isGuest,
  navigate,
  handleLessonClick
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <LessonCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return null; // Error is handled at the parent level
  }

  if (lessons.length === 0) {
    return (
      <Card className="border">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">No lessons available for this unit yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {lessons.map((lesson) => (
        <LessonCard 
          key={lesson.id}
          lesson={lesson}
          isGuest={isGuest}
          onClick={() => handleLessonClick(lesson)}
        />
      ))}

      {isGuest && (
        <div className="mt-6">
          <Button 
            className="w-full bg-nihongo-red hover:bg-nihongo-red/90"
            onClick={() => navigate('/auth?tab=signup')}
          >
            Sign Up to Unlock All Lessons
          </Button>
        </div>
      )}
    </div>
  );
};
