
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const NoReviewItems: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <h3 className="text-lg font-medium mb-2">No Items to Review</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Complete more lessons to add vocabulary to your review queue.
        </p>
        <Button onClick={() => navigate("/app/units")}>
          Go to Lessons
        </Button>
      </CardContent>
    </Card>
  );
};
