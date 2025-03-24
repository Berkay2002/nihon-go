
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { HomeHeader } from "./HomeHeader";

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
  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <HomeHeader username={username} isGuest={isGuest} />
      
      <Card className="my-8 border-red-200">
        <CardContent className="pt-6 flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
          <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
          <p className="text-center text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} className="bg-nihongo-blue hover:bg-nihongo-blue/90">
            Refresh
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
