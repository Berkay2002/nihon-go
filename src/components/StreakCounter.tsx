
import { Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StreakCounterProps {
  streak: number;
}

const StreakCounter = ({ streak }: StreakCounterProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center bg-nihongo-red/10 px-3 py-2 rounded-full cursor-pointer hover:bg-nihongo-red/20 transition-colors">
            <Flame className="w-5 h-5 text-nihongo-red mr-1 animate-pulse-scale" />
            <span className="font-bold text-nihongo-red">{streak}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Your current streak: {streak} days</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StreakCounter;
