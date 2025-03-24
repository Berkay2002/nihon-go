
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Book, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, isSelected, onClick }) => {
  return (
    <Card 
      key={unit.id} 
      className={`flex-shrink-0 w-36 h-36 snap-start cursor-pointer transition-all duration-300 transform ${
        isSelected ? 'scale-[1.02] border-nihongo-red shadow-md' : 'border-gray-200'
      } ${unit.is_locked ? 'opacity-70' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center relative">
        {unit.is_locked && (
          <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center rounded-md">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className={`w-12 h-12 rounded-full ${
          !unit.is_locked ? 'bg-nihongo-red/10' : 'bg-gray-200'
        } flex items-center justify-center mb-2`}>
          <Book className={`w-6 h-6 ${
            !unit.is_locked ? 'text-nihongo-red' : 'text-gray-400'
          }`} />
        </div>
        <h3 className="font-semibold text-sm">{unit.name}</h3>
        {unit.progress !== undefined && unit.progress > 0 && (
          <Progress value={unit.progress} className="h-1 mt-2 w-full bg-gray-100" 
            indicatorClassName="bg-nihongo-red" />
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
