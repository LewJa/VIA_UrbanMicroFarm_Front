import type {SetupReading} from "~/features/growingSetups/types";
import {useEffect, useState} from "react";
import {growingSetupsService} from "~/features/growingSetups/service/growingSetupsService";

type GrowingSetupCardProps = {
    setupId: number;
  name: string;
};

export default function GrowingSetupCard({
                                             setupId,
  name,
}: GrowingSetupCardProps) {

    const [loading, setLoading] = useState(true);
    const [readingsError, setReadingsError] = useState<string | null>(null);
    const [setupReadings, setSetupReadings] = useState<SetupReading | undefined>(undefined)

    useEffect(() => {
        const fetchReadings = async () => {
            const readings = await growingSetupsService.getSetupSensorReadings(setupId);
            setSetupReadings(readings);
        };

        fetchReadings();

    }, [loading, setupReadings]);

  return (
    <div>
      <h1>{name}</h1>

        {setupReadings ? (
            <>
                <div>Temperature: {setupReadings.temperature}°</div>
                <div>Humidity: {setupReadings.humidity}%</div>
                <div>Light: {setupReadings.light}%</div>
            </>
        ) : (
            <div>No readings available</div>
        )}
    </div>
  );
}