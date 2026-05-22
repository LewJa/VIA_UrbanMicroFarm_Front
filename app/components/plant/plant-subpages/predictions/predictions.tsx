import { useOutletContext } from "react-router";
import PredictionsChart from "./PredictionsChart";
import type { PlantContext } from "../plant-layout";

export default function Predictions() {
  const { plant, plantLoading, plantError } = useOutletContext<PlantContext>();

  if (plantLoading) {
    return (
      <div aria-busy="true" aria-label="Loading plant data">
        Loading plant data…
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

  return <PredictionsChart plantId={plant.id} plantName={plant.name} />;
}
