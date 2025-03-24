
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";

interface GuestPromotionProps {
  navigate: NavigateFunction;
}

export const GuestPromotion: React.FC<GuestPromotionProps> = ({ navigate }) => {
  return (
    <section className="mt-8">
      <Card className="border-nihongo-red/20 bg-nihongo-red/5">
        <CardContent className="p-4">
          <h3 className="font-semibold text-center mb-3">Ready to track your progress?</h3>
          <Button 
            className="w-full bg-nihongo-red hover:bg-nihongo-red/90"
            onClick={() => navigate('/auth?tab=signup')}
          >
            Create Free Account
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};
