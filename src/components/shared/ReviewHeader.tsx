
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReviewHeaderProps {
  title: string;
}

export const ReviewHeader: React.FC<ReviewHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/app/home")}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/app/home")}
      >
        <Home className="h-5 w-5" />
      </Button>
    </div>
  );
};
