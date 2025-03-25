import React, { useRef, useEffect, useState } from "react";
import { UnitCard, UnitCardSkeleton } from "./UnitCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndicator, setActiveIndicator] = useState<number>(0);

  // Find the index of the current selected unit
  useEffect(() => {
    const selectedIndex = units.findIndex(unit => unit.id === selectedUnit);
    if (selectedIndex >= 0) {
      setActiveIndicator(selectedIndex);
    }
  }, [selectedUnit, units]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      
      // Update the active indicator when scrolling left
      if (activeIndicator > 0) {
        const prevUnitId = units[activeIndicator - 1].id;
        if (!units[activeIndicator - 1].is_locked) {
          onSelectUnit(prevUnitId);
          setActiveIndicator(activeIndicator - 1);
        }
      }
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      
      // Update the active indicator when scrolling right
      if (activeIndicator < units.length - 1) {
        const nextUnitId = units[activeIndicator + 1].id;
        if (!units[activeIndicator + 1].is_locked) {
          onSelectUnit(nextUnitId);
          setActiveIndicator(activeIndicator + 1);
        }
      }
    }
  };

  // Function to scroll to a specific unit card
  const scrollToUnit = (index: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const unitElements = Array.from(container.children);
    
    if (index >= 0 && index < unitElements.length) {
      const targetElement = unitElements[index] as HTMLElement;
      const containerWidth = container.offsetWidth;
      const elementWidth = targetElement.offsetWidth;
      
      // Calculate center position of the target element
      const scrollLeft = targetElement.offsetLeft - (containerWidth / 2) + (elementWidth / 2);
      
      // Scroll to the element
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  // Combined function to select unit and scroll to it
  const handleUnitSelection = (index: number) => {
    if (index >= 0 && index < units.length && !units[index].is_locked) {
      onSelectUnit(units[index].id);
      setActiveIndicator(index);
      scrollToUnit(index);
    }
  };

  if (loading && !units.length) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Units</h2>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-6 units-scroll-container hide-horizontal-scrollbar">
            {[1, 2, 3].map((i) => <UnitCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Units</h2>
        
        {units.length > 2 && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full border-gray-200 dark:border-gray-800"
              onClick={scrollLeft}
              disabled={activeIndicator === 0 || units[activeIndicator - 1]?.is_locked}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full border-gray-200 dark:border-gray-800"
              onClick={scrollRight}
              disabled={activeIndicator === units.length - 1 || units[activeIndicator + 1]?.is_locked}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-6 snap-x units-scroll-container hide-horizontal-scrollbar"
        >
          {units.map((unit, index) => (
            <UnitCard 
              key={unit.id}
              unit={unit}
              isSelected={index === activeIndicator}
              onClick={() => handleUnitSelection(index)}
              className="unit-card"
              dataUnitId={unit.id}
            />
          ))}
        </div>

        {/* Pagination indicators */}
        {units.length > 1 && (
          <div className="flex justify-center space-x-1 mt-2">
            {units.map((unit, index) => (
              <button 
                key={unit.id}
                className={cn(
                  "focus:outline-none transition-all duration-200",
                  unit.is_locked ? "cursor-not-allowed" : "cursor-pointer"
                )}
                onClick={() => handleUnitSelection(index)}
                disabled={unit.is_locked}
                aria-label={`Select ${unit.name} unit`}
              >
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all", 
                    index === activeIndicator 
                      ? 'w-6 bg-nihongo-red' 
                      : 'w-1.5 bg-gray-300 dark:bg-gray-700',
                    unit.is_locked && "opacity-50"
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
