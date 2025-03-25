
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { HomeHeader } from "./HomeHeader";

interface ErrorStateProps {
  username: string;
  error: string;
  handleRefresh: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  username,
  error,
  handleRefresh,
}) => {
  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20">
      <HomeHeader username={username} />
      
      <Card className="border border-nihongo-error/20 bg-nihongo-error/5 shadow-md mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-nihongo-error">Error Loading Data</h2>
          <p className="text-sm mb-4">{error}</p>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center border-nihongo-error/30 text-nihongo-error hover:bg-nihongo-error/5"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
