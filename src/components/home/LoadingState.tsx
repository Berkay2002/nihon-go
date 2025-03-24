
import React from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { HomeHeader } from "./HomeHeader";

interface LoadingStateProps {
  username: string;
  isGuest: boolean;
  longLoading: boolean;
  handleRefresh: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  username,
  isGuest,
  longLoading,
  handleRefresh,
}) => {
  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <HomeHeader username={username} isGuest={isGuest} />
      
      <div className="py-8">
        <LoadingSpinner />
        <p className="text-center text-muted-foreground mt-4">
          {longLoading 
            ? "Still loading... This is taking longer than usual." 
            : "Loading your progress..."}
        </p>
        
        {longLoading && (
          <div className="flex justify-center mt-4">
            <Button onClick={handleRefresh} size="sm" variant="outline">
              Refresh Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
