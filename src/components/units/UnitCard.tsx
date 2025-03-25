import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Book, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Unit {
  id: string;
  name: string;
  description: string;
  order_index: number;
  is_locked: boolean;
  progress?: number;
}

interface UnitCardProps {
  unit: Unit;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
  dataUnitId?: string;
}

export const UnitCard: React.FC<UnitCardProps> = ({ 
  unit, 
  isSelected, 
  onClick,
  className = "",
  dataUnitId
}) => {
  return (
    <Card 
      key={unit.id} 
      className={cn(
        "flex-shrink-0 w-36 h-48 snap-start cursor-pointer transition-all duration-300 overflow-hidden relative group",
        "hover:shadow-lg hover:translate-y-[-3px]",
        isSelected ? 
          "border-nihongo-red shadow-md dark:border-nihongo-red" : 
          "border-gray-200 dark:border-gray-800",
        unit.is_locked ? "opacity-80" : "",
        className
      )}
      onClick={onClick}
      data-unit-id={dataUnitId || unit.id}
    >
      {isSelected && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nihongo-red to-nihongo-red/80" />
      )}
      
      <CardContent className="p-0 flex flex-col items-center h-full text-center relative">
        <div className={cn(
          "w-full h-24 flex items-center justify-center",
          !unit.is_locked ? 
            "bg-nihongo-red/10 dark:bg-nihongo-red/20" : 
            "bg-gray-100 dark:bg-gray-800"
        )}>
          {unit.is_locked ? (
            <Lock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          ) : (
            <Book 
              className={cn(
                "w-10 h-10 text-nihongo-red",
                isSelected && "animate-pulse-light"
              )} 
            />
          )}
        </div>
        
        <div className="p-3 flex-1 flex flex-col justify-between w-full">
          <h3 className="font-semibold text-sm">{unit.name}</h3>
          
          <div className="w-full mt-2">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className={cn(
                "font-medium",
                unit.progress && unit.progress > 0 ? "text-nihongo-blue" : "text-muted-foreground"
              )}>
                {unit.progress || 0}%
              </span>
            </div>
            <Progress 
              value={unit.progress || 0} 
              className="h-1.5 w-full bg-gray-100 dark:bg-gray-800" 
              indicatorClassName={cn(
                "bg-gradient-to-r",
                unit.progress && unit.progress >= 100 ? 
                  "from-nihongo-green to-nihongo-green/80" : 
                  "from-nihongo-blue to-nihongo-red"
              )} 
            />
          </div>
        </div>
        
        {unit.is_locked && (
          <div className="absolute inset-0 bg-background/50 dark:bg-gray-900/70 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-background/80 dark:bg-gray-800/80 p-2 rounded-full">
              <Lock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const UnitCardSkeleton: React.FC = () => {
  return (
    <Card className="flex-shrink-0 w-36 h-36 snap-start">
      <CardContent className="p-4 flex flex-col items-center justify-center h-full">
        <Skeleton className="w-12 h-12 rounded-full mb-2" />
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className="h-2 w-16" />
      </CardContent>
    </Card>
  );
};
