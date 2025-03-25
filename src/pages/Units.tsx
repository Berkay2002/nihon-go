
import { useNavigate, useParams } from "react-router-dom";
import { UnitsList } from "@/components/units/UnitsList";
import { UnitsHeader } from "@/components/units/UnitsHeader";
import { UnitContent } from "@/components/units/UnitContent";
import { useUnitsData } from "@/hooks/useUnitsData";
import { useTheme } from "@/providers/ThemeProvider";

const Units = () => {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const { theme } = useTheme();
  const {
    selectedUnit,
    setSelectedUnit,
    units,
    lessons,
    loading,
    currentUnit,
    fetchUnits,
    fetchLessons
  } = useUnitsData(unitId);

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <UnitsHeader navigate={navigate} />
      
      <section className="mb-8 overflow-hidden">
        <UnitsList 
          units={units} 
          selectedUnit={selectedUnit} 
          loading={loading && !units.length} 
          onSelectUnit={setSelectedUnit} 
        />
      </section>

      <UnitContent 
        currentUnit={currentUnit}
        lessons={lessons}
        loading={loading}
        error={null}
        navigate={navigate}
      />
    </div>
  );
};

export default Units;
