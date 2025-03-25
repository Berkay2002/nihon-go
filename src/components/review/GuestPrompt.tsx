
import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const GuestPrompt: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Star className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Spaced Repetition Review</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to track your vocabulary progress and review words at optimal intervals
          </p>
        </div>
        
        <div className="pt-4 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/app/units")}
          >
            Browse Lessons
          </Button>
          <Button 
            className="w-full" 
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
