import { useParams } from "react-router";
import { PlantLayout } from "~/components/plant/plant-subpages/plant-layout";

export default function PlantRoute() {
  const { plantId } = useParams<{ plantId: string }>();

  return <PlantLayout plantId={plantId ?? ""} />;
}
