
import React from "react";

interface Unit {
  id: string;
  name: string;
  description: string;
  order_index: number;
  is_locked: boolean;
  progress?: number;
}

interface UnitInfoProps {
  unit: Unit | undefined;
}

export const UnitInfo: React.FC<UnitInfoProps> = ({ unit }) => {
  if (!unit) return null;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{unit.name}</h2>
        {unit.progress !== undefined && unit.progress > 0 && (
          <div className="bg-nihongo-blue/10 px-3 py-1 rounded-full text-xs font-medium text-nihongo-blue">
            {unit.progress}% Complete
          </div>
        )}
      </div>
      <p className="text-muted-foreground">{unit.description}</p>
    </div>
  );
};
