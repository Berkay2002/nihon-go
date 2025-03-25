import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCharacter } from "./GameCharacter";

interface ErrorStateProps {
  username: string;
  error: string;
  handleRefresh: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  username,
  error,
  handleRefresh
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <GameCharacter state="surprised" className="mb-6" />
      
      <h1 className="text-2xl font-bold mb-2">Oops, something went wrong!</h1>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-lg w-full">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error loading your progress</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
      
      <p className="text-gray-500 mb-6 text-center">
        Don't worry, {username}! We can try to refresh the page to fix this issue.
      </p>
      
      <Button onClick={handleRefresh} className="flex items-center">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};
