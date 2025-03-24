
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface TimeoutErrorProps {
  onRefresh: () => void;
}

export const TimeoutError: React.FC<TimeoutErrorProps> = ({ onRefresh }) => {
  return (
    <Card className="my-8 border-red-200">
      <CardContent className="pt-6 flex flex-col items-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
        <h3 className="text-lg font-semibold mb-2">Connection Issue</h3>
        <p className="text-center text-muted-foreground mb-4">
          We're having trouble connecting to the server. This might be due to network issues.
        </p>
        <Button onClick={onRefresh} className="bg-nihongo-blue hover:bg-nihongo-blue/90">
          Refresh Page
        </Button>
      </CardContent>
    </Card>
  );
};
