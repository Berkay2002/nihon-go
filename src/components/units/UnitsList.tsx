
import React from "react";
import { UnitCard, UnitCardSkeleton } from "./UnitCard";
import { useTheme } from "@/providers/ThemeProvider";

interface Unit {
  id: string;
  name: string;
  description: string;
  order_index: number;
  is_locked: boolean;
  progress?: number;
}

interface UnitsListProps {
  units: Unit[];
  selectedUnit: string;
  loading: boolean;
  onSelectUnit: (unitId: string) => void;
}

export const UnitsList: React.FC<UnitsListProps> = ({ 
  units, 
  selectedUnit, 
  loading, 
  onSelectUnit 
}) => {
  const { theme } = useTheme();
  
  if (loading && !units.length) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
        {[1, 2, 3].map((i) => <UnitCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
      {units.map((unit) => (
        <UnitCard 
          key={unit.id}
          unit={unit}
          isSelected={unit.id === selectedUnit}
          onClick={() => !unit.is_locked && onSelectUnit(unit.id)}
        />
      ))}
    </div>
  );
};
