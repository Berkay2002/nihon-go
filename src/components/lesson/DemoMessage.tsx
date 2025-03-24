
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DemoMessageProps {
  isGuest: boolean;
}

export const DemoMessage: React.FC<DemoMessageProps> = ({ isGuest }) => {
  const navigate = useNavigate();
  
  if (!isGuest) return null;
  
  return (
    <Card className="border border-nihongo-blue/20 bg-nihongo-blue/5 mb-8">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="shrink-0 mt-1">
            <Lock className="h-5 w-5 text-nihongo-blue" />
          </div>
          <div>
            <h3 className="font-medium text-nihongo-blue">Demo Mode</h3>
            <p className="text-sm text-muted-foreground">
              You're viewing a preview of this lesson. 
              <Button 
                variant="link" 
                className="h-auto p-0 text-nihongo-red"
                onClick={() => navigate('/auth?tab=signup')}
              >
                Sign up
              </Button>{' '}
              to access all vocabulary and save your progress.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
