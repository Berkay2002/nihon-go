
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { HomeHeader } from "./HomeHeader";

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
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
      <HomeHeader username={username} />
      
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nihongo-red"></div>
        </div>
        
        <h2 className="text-xl font-semibold mb-2 text-center">Loading your progress...</h2>
        <p className="text-muted-foreground text-center mb-6">
          {longLoading
            ? "This is taking longer than expected. The server might be busy."
            : "Please wait while we retrieve your latest data."}
        </p>
        
        {longLoading && (
          <Card className="border border-orange-200 bg-orange-50 w-full mb-6">
            <CardContent className="p-4">
              <p className="text-sm text-orange-700">
                Connection issue detected. You can try refreshing the page.
              </p>
            </CardContent>
          </Card>
        )}
        
        {longLoading && (
          <Button
            variant="outline"
            className="flex items-center"
            onClick={retry}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        )}
      </div>
    </div>
  );
};
