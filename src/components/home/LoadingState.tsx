import React from "react";
import { Button } from "@/components/ui/button";
import { GameCharacter } from "./GameCharacter";

interface LoadingStateProps {
  username: string;
  retry: () => void;
  longLoading: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  username,
  retry,
  longLoading
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <GameCharacter state="thinking" className="mb-6" />
      
      <h1 className="text-2xl font-bold mb-2">Welcome back, {username}!</h1>
      
      <div className="text-center mb-8">
        <p className="text-gray-500 mb-2">Loading your learning progress...</p>
      </div>
      
      {longLoading && (
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            This is taking longer than expected. Would you like to try again?
          </p>
          <Button onClick={retry} variant="outline">
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
