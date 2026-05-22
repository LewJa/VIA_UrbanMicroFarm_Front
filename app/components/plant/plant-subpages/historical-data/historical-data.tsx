import { useOutletContext, useParams } from "react-router";
import SoilMoistureHistoryChart from "./SoilMoistureHistoryChart";
import type { PlantContext } from "../plant-layout";

export default function HistoricalData() {
  const { plant, plantLoading, plantError } = useOutletContext<PlantContext>();
  const { setupId } = useParams<{ setupId: string }>();

  if (plantLoading) {
    return (
        <div
            aria-busy="true"
            aria-label="Loading plant data"
            className="mf-card p-6"
        >
          <div className="h-3 w-32 bg-mf-line rounded-full animate-pulse mb-4" />
          <div className="h-[300px] bg-mf-line/40 rounded-mf-md animate-pulse" />
        </div>
    );
  }

  if (plantError) {
    return (
        <div
            role="alert"
            className="mf-card p-6 border-[#E9C3B5] bg-[#F4DBD2]/40 text-mf-ink-2 text-sm"
        >
          {plantError}
        </div>
    );
  }

  if (!plant) return null;

  return (
      <SoilMoistureHistoryChart
          sensorId={plant.sensorId}
          plantName={plant.name}
          setupId={setupId !== undefined ? Number(setupId) : undefined}
      />
  );
}
