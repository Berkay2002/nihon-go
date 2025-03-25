
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface ReviewHeaderProps {
  title: string;
  currentIndex?: number;
  totalItems?: number;
}

export const ReviewHeader: React.FC<ReviewHeaderProps> = ({ 
  title, 
  currentIndex = 0, 
  totalItems = 0 
}) => {
  const navigate = useNavigate();
  const progress = totalItems > 0 ? (currentIndex / totalItems) * 100 : 0;

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/app/home")}
          aria-label="Exit review"
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="text-lg font-medium">{title}</div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/app/home")}
          aria-label="Go home"
        >
          <Home className="h-5 w-5" />
        </Button>
      </div>
      
      {totalItems > 0 && (
        <Progress 
          value={progress} 
          className="h-2 bg-gray-200 dark:bg-gray-700" 
          indicatorClassName="bg-green-500"
        />
      )}
    </div>
  );
};
