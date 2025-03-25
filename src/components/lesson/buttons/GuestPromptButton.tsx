
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface GuestPromptButtonProps {
  variant?: "default" | "outline";
  className?: string;
}

export const GuestPromptButton: React.FC<GuestPromptButtonProps> = ({ 
  variant = "outline",
  className = "w-full"
}) => {
  const navigate = useNavigate();

  return (
    <Button 
      variant={variant}
      className={className} 
      onClick={() => navigate('/auth?tab=signup')}
    >
      Sign Up to Save Progress
    </Button>
  );
};
