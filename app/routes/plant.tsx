import type { Route } from "./+types/plant";

import PlantCard from "../features/plants/plant-card/plant-card";

export async function clientLoader({
  params,
}: Route.LoaderArgs) {

  const plantId = params.plantId;

  return { plantId };
}

export default function PlantRoute() {

  return (

    <PlantCard
  name="Basil"
  type="Herb"
  lastWatered="6h"
  sunlight="Full"
  createdAt={new Date().toISOString()}
  moisture={62}
  temperature={24}
  humidity={55}
  light={80}
/>

  );
}