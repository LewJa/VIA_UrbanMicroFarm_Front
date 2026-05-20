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
      name="Sweet basil"
      type="Lamiaceae"
      lastWatered="6h"
      sunlight="6.4 hrs"
      moisture={62}
      temperature={22}
      humidity={64}
      light={68}
    />

  );
}