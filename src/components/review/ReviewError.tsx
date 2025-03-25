
import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReviewErrorProps {
  error: string;
}

export const ReviewError: React.FC<ReviewErrorProps> = ({ error }) => {
  return (
    <Card className="max-w-md w-full">
      <CardContent className="pt-6 flex flex-col items-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-center text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="w-full">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
};
