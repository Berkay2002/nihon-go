
import { useNavigate, useParams } from "react-router-dom";
import { ErrorMessage } from "@/components/units";
import { UnitsList } from "@/components/units/UnitsList";
import { UnitsHeader } from "@/components/units/UnitsHeader";
import { TimeoutError } from "@/components/units/TimeoutError";
import { UnitContent } from "@/components/units/UnitContent";
import { useUnitsData } from "@/hooks/useUnitsData";

const Units = () => {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const {
    selectedUnit,
    setSelectedUnit,
    units,
    lessons,
    loading,
    error,
    loadingTimeout,
    currentUnit,
    handleRefresh,
    fetchUnits,
    fetchLessons
  } = useUnitsData(unitId);

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <UnitsHeader navigate={navigate} />
      
      {loadingTimeout ? (
        <TimeoutError onRefresh={handleRefresh} />
      ) : (
        <>
          {error && <ErrorMessage error={error} onRetry={() => { fetchUnits(); fetchLessons(); }} />}

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
            error={error}
            navigate={navigate}
          />
        </>
      )}
    </div>
  );
};

export default Units;
