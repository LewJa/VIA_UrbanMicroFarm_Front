import PlantCard from "../plant-card/plant-card";

export default function Predictions() {
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