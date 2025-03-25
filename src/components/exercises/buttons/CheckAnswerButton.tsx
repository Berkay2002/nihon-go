
import React from "react";
import { Button } from "@/components/ui/button";

interface CheckAnswerButtonProps {
  isInputValid: boolean;
  onCheckAnswer: () => void;
}

export const CheckAnswerButton: React.FC<CheckAnswerButtonProps> = ({
  isInputValid,
  onCheckAnswer
}) => {
  return (
    <Button 
      className="w-full bg-nihongo-blue hover:bg-nihongo-blue/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      onClick={onCheckAnswer}
      disabled={!isInputValid}
    >
      Check Answer
    </Button>
  );
};
