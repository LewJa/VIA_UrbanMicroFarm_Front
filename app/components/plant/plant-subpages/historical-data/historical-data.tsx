import { useOutletContext, useParams } from "react-router";
import SoilMoistureHistoryChart from "./SoilMoistureHistoryChart";
import type { PlantContext } from "../plant-layout";

export default function HistoricalData() {
  const { plant, plantLoading, plantError } = useOutletContext<PlantContext>();
  const { setupId } = useParams<{ setupId: string }>();

  if (plantLoading) {
    return (
      <div aria-busy="true" aria-label="Loading plant data">
        Loading plant data…
      </div>
    );
  }

  if (plantError) {
    return <div role="alert">{plantError}</div>;
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
