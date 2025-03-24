
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Zap } from "lucide-react";
import { Lesson } from "@/services/contentService";

interface LessonOverviewProps {
  lesson: Lesson;
}

export const LessonOverview: React.FC<LessonOverviewProps> = ({ lesson }) => {
  return (
    <section className="mb-8">
      <Card className="border border-nihongo-blue/10 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-nihongo-blue/10 flex items-center justify-center mr-3">
                <BookOpen className="w-5 h-5 text-nihongo-blue" />
              </div>
              <div>
                <h3 className="font-semibold">Overview</h3>
                <p className="text-xs text-muted-foreground">{lesson.estimated_time} · Exercises</p>
              </div>
            </div>
            <div className="flex items-center bg-nihongo-red/10 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4 text-nihongo-red mr-1" />
              <span className="text-xs font-medium text-nihongo-red">{lesson.xp_reward} XP</span>
            </div>
          </div>
          <p className="text-sm mb-4">{lesson.description}</p>
        </CardContent>
      </Card>
    </section>
  );
};
