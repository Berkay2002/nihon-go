
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";
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
              You're currently exploring in demo mode. Progress will not be saved. 
              <Button 
                variant="link" 
                className="h-auto p-0 text-nihongo-red"
                onClick={() => navigate('/auth?tab=signup')}
              >
                Sign up
              </Button>{' '}
              to track your progress and unlock all features.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
