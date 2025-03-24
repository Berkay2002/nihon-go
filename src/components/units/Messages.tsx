
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockIcon, AlertCircle, RefreshCw } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

interface GuestMessageProps {
  navigate: NavigateFunction;
}

export const GuestMessage: React.FC<GuestMessageProps> = ({ navigate }) => {
  return (
    <Card className="border border-nihongo-blue/20 bg-nihongo-blue/5 mb-8">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="shrink-0 mt-1">
            <LockIcon className="h-5 w-5 text-nihongo-blue" />
          </div>
          <div>
            <h3 className="font-medium text-nihongo-blue">Demo Mode</h3>
            <p className="text-sm text-muted-foreground">
              In demo mode, only the first lesson is available. 
              <Button 
                variant="link" 
                className="h-auto p-0 text-nihongo-red"
                onClick={() => navigate('/auth?tab=signup')}
              >
                Sign up
              </Button>{' '}
              to unlock all content.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
