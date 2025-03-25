
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LessonCard, LessonCardSkeleton } from "./LessonCard";
import { NavigateFunction } from "react-router-dom";
import { LessonWithProgress } from "@/hooks/useUnitsData";

interface LessonsListProps {
  lessons: LessonWithProgress[];
  loading: boolean;
  error: string | null;
  navigate: NavigateFunction;
  handleLessonClick: (lesson: LessonWithProgress) => void;
}

export const LessonsList: React.FC<LessonsListProps> = ({
  lessons,
  loading,
  error,
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
          onClick={() => handleLessonClick(lesson)}
        />
      ))}
    </div>
  );
};
