
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

interface UnitsHeaderProps {
  navigate: NavigateFunction;
}

export const UnitsHeader: React.FC<UnitsHeaderProps> = ({ navigate }) => {
  return (
    <header className="mb-6">
      <Button variant="ghost" className="p-0 h-auto mb-4" onClick={() => navigate('/app')}>
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span>Back to Home</span>
      </Button>
      <h1 className="text-2xl font-bold">Japanese Lessons</h1>
    </header>
  );
};
