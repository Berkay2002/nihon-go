
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { HomeHeader } from "./HomeHeader";
import seedDataService from "@/services/seedDataService";
import { toast } from "sonner";
import DatabaseDebugger from "@/components/debug/DatabaseDebugger";

interface ErrorStateProps {
  username: string;
  isGuest: boolean;
  error: string;
  handleRefresh: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  username,
  isGuest,
  error,
  handleRefresh,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLoadDemoLessons = async () => {
    try {
      setIsLoading(true);
      await seedDataService.seedInitialData();
      toast.success("Demo lessons loaded successfully");
      handleRefresh(); // Refresh page after loading demo data
    } catch (err) {
      console.error("Error loading demo lessons:", err);
      toast.error("Failed to load demo lessons", {
        description: "Please try again or refresh the page"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <HomeHeader username={username} isGuest={isGuest} />
      
      <DatabaseDebugger />
      
      <Card className="my-8 border-red-200">
        <CardContent className="pt-6 flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
          <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
          <p className="text-center text-muted-foreground mb-4">{error}</p>
          <div className="flex flex-col gap-3 w-full items-center">
            <Button 
              onClick={handleRefresh} 
              className="bg-nihongo-blue hover:bg-nihongo-blue/90 w-full flex items-center justify-center"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleLoadDemoLessons} 
              variant="outline" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load Demo Lessons"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
