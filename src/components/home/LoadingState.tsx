
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { HomeHeader } from "./HomeHeader";
import { toast } from "sonner";
import seedDataService from "@/services/seedDataService";

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
  // Add automatic data seeding if loading takes too long
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (longLoading) {
      timeoutId = setTimeout(async () => {
        // Try to seed initial data automatically
        try {
          await seedDataService.seedInitialData();
          // Don't refresh immediately, wait for the user to click the button
          toast.info("Initial data has been loaded", {
            description: "Please refresh the page to see the lessons."
          });
        } catch (error) {
          console.error("Error auto-seeding data:", error);
        }
      }, 3000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [longLoading]);

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
          <div className="flex flex-col items-center mt-4 gap-3">
            <Button onClick={handleRefresh} size="sm" variant="outline">
              Refresh Page
            </Button>
            <Button 
              onClick={() => seedDataService.seedInitialData()} 
              size="sm" 
              variant="secondary"
              className="bg-nihongo-blue/10 hover:bg-nihongo-blue/20 text-nihongo-blue"
            >
              Load Demo Lessons
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
