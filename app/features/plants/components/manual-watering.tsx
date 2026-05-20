import { useState } from "react";
import { wateringService } from "../../../services/wateringService";

export default function ManualWatering() {

  const [message, setMessage] =
    useState("");

  const [lastEvent, setLastEvent] =
    useState<any>(null);

  const handleWatering = async () => {

    const result =
      await wateringService
        .triggerManualWatering(1);

    setMessage(result.message);

    const event =
      await wateringService
        .getLastWateringEvent(1);

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