
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Lesson } from "@/services/contentService";

interface LessonHeaderProps {
  lesson: Lesson;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({ lesson }) => {
  const navigate = useNavigate();
  
  return (
    <header className="mb-6">
      <Button variant="ghost" className="p-0 h-auto mb-4" onClick={() => navigate('/app/units')}>
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span>Back to Units</span>
      </Button>
      <h1 className="text-2xl font-bold">{lesson.title}</h1>
      <p className="text-muted-foreground">{lesson.description}</p>
    </header>
  );
};
