
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { LessonCard, LessonCardSkeleton } from "./LessonCard";
import { NavigateFunction } from "react-router-dom";
import { LessonWithProgress } from "@/hooks/useUnitsData";
import { toast } from "sonner";

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
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    toast.info("Retrying lesson data fetch...");
    
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (loading || retrying) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <LessonCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-red-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center p-4">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-lg font-medium mb-2">Connection Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground mb-4">
              Lesson ID may not be accessible due to connection issues.
            </p>
            <Button 
              onClick={handleRetry} 
              className="flex items-center gap-2 bg-nihongo-blue hover:bg-nihongo-blue/90"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
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
