
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

interface RecentLesson {
  id: string;
  title: string;
  unitName: string;
  isCompleted: boolean;
  accuracy: number;
  xpEarned: number;
}

interface RecentLessonsSectionProps {
  recentLessons: RecentLesson[];
  navigate: NavigateFunction;
}

export const RecentLessonsSection: React.FC<RecentLessonsSectionProps> = ({ 
  recentLessons, navigate 
}) => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recent Lessons</h2>
      </div>
      
      <div className="space-y-3">
        {recentLessons.map((lesson, index) => (
          <Card 
            key={index}
            className={`border transition-all cursor-pointer ${
              lesson.isCompleted ? 'border-nihongo-green/30' : 'border-gray-200'
            }`}
            onClick={() => navigate(`/app/lesson/${lesson.id}`)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-sm">{lesson.title}</h3>
                    <p className="text-xs text-muted-foreground">{lesson.unitName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {lesson.isCompleted && (
                    <div className="flex items-center bg-nihongo-green/10 px-2 py-1 rounded-full mr-2">
                      <CheckCircle2 className="w-3 h-3 text-nihongo-green mr-1" />
                      <span className="text-xs font-medium text-nihongo-green">
                        {lesson.accuracy}%
                      </span>
                    </div>
                  )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
