import type { Route } from "./+types/plant";
import { PlantLayout } from "../features/plants/components/plant-layout";

export async function clientLoader({ params }: Route.LoaderArgs) {
    const plantId = params.plantId;
    return { plantId };
}

export default function PlantRoute({ loaderData }: Route.ComponentProps) {
    return <PlantLayout plantId={loaderData.plantId} />;
}