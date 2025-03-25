
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MistakesIcon, WordsIcon, SRSReviewIcon } from "./SkillPracticeIcons";

interface NoReviewItemsProps {
  type?: "vocabulary" | "difficult" | "words" | "mistakes";
  title?: string;
  message?: string;
}

export const NoReviewItems: React.FC<NoReviewItemsProps> = ({
  type = "vocabulary",
  title,
  message
}) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (type) {
      case "difficult":
      case "mistakes":
        return <MistakesIcon />;
      case "words":
        return <WordsIcon />;
      case "vocabulary":
      default:
        return <SRSReviewIcon />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case "difficult":
      case "mistakes":
        return "No Mistakes to Practice";
      case "words":
        return "No Vocabulary Words Available";
      case "vocabulary":
      default:
        return "No Review Items Available";
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case "difficult":
      case "mistakes":
        return "As you complete more lessons, exercises you find challenging will appear here for extra practice.";
      case "words":
        return "Complete more lessons to unlock vocabulary words for practice.";
      case "vocabulary":
      default:
        return "Complete more lessons to add vocabulary to your review queue.";
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="pt-6 flex flex-col items-center">
        <div className="mb-4 w-20 h-20 flex items-center justify-center">
          {getIcon()}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{getTitle()}</h3>
        <p className="text-slate-300 text-center mb-6">
          {getMessage()}
        </p>
        <Button 
          onClick={() => navigate("/app")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue Learning
        </Button>
      </CardContent>
    </Card>
  );
};
