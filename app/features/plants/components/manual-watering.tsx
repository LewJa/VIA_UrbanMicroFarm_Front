import { useState } from "react";
import { useParams } from "react-router";
import type { WateringEvent } from "../../../model/growingSetup/types";
import { wateringService } from "../../../services/wateringService";

export default function ManualWatering() {

  const { plantId, setupId } = useParams();

  const [message, setMessage] =
    useState("");

  const [lastEvent, setLastEvent] =
    useState<WateringEvent | null>(null);

  const handleWatering = async () => {

    const result =
      await wateringService
        .triggerManualWatering(Number(plantId));

    setMessage(result.message);

    const event =
      await wateringService
        .getLastWateringEvent(Number(setupId));

    setLastEvent(event);
  };

  return (
    <div>

      <button onClick={handleWatering}>
        Water Plant
      </button>

      {message && (
        <p>{message}</p>
      )}

      {lastEvent && (
        <div>

          <p>
            Watering Event Logged
          </p>

          <p>
            Mode: {lastEvent.mode}
          </p>

        </div>
      )}

    </div>
  );
}