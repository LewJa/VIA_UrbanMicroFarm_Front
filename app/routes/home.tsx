import { useState } from "react";
import { AddPlantModal } from "../features/plants/components/add-plant-popup";
import GrowingSetupCard from "../features/growingSetups/components/growing-setup-card";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContinue = (data: {
    name: string;
    type: string;
    sensorId: number;
  }) => {
    console.log(data);
    setIsModalOpen(false);
  };

  return (
    <>
      <GrowingSetupCard
        name="Growing setup"
        temperature={22}
        humidity={64}
        light={68}
      />

      <button onClick={() => setIsModalOpen(true)}>Add plant</button>

      <AddPlantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={handleContinue}
        setupId={1}
      />
    </>
  );
}
