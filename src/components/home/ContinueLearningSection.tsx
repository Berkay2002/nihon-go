
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Zap, ArrowRight } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

interface NextLesson {
  id: string;
  title: string;
  unitName: string;
  xp_reward: number;
}

interface ContinueLearningProps {
  nextLesson: NextLesson | null;
  navigate: NavigateFunction;
}

export const ContinueLearningSection: React.FC<ContinueLearningProps> = ({ 
  nextLesson, navigate 
}) => {
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Continue Learning</h2>
      </div>
      
      {nextLesson ? (
        <Card 
          className="border hover:shadow-md transition-all cursor-pointer mb-4"
          onClick={() => navigate(`/app/lesson/${nextLesson.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-nihongo-red/10 flex items-center justify-center mr-3">
                  <BookOpen className="w-6 h-6 text-nihongo-red" />
                </div>
                <div>
                  <h3 className="font-semibold">{nextLesson.title}</h3>
                  <p className="text-xs text-muted-foreground">{nextLesson.unitName}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center bg-nihongo-red/10 px-2 py-1 rounded-full mb-2">
                  <Zap className="w-3 h-3 text-nihongo-red mr-1" />
                  <span className="text-xs font-medium text-nihongo-red">{nextLesson.xp_reward} XP</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border mb-4">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">All lessons completed!</p>
            <Button 
              className="mt-2" 
              variant="outline" 
              onClick={() => navigate('/app/units')}>
              Browse All Units
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Button 
        variant="outline" 
        className="w-full border-nihongo-blue/30 hover:bg-nihongo-blue/5 text-nihongo-blue"
        onClick={() => navigate('/app/units')}
      >
        View All Lessons
      </Button>
    </section>
  );
};
