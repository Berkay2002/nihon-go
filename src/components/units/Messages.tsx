import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  error: string;
  onRetry: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  return (
    <Card className="border border-destructive/20 bg-destructive/5 mb-8">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="shrink-0 mt-1">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-medium text-destructive">Error</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={onRetry}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
