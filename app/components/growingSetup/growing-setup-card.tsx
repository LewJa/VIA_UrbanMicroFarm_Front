import type {SetupReading} from "~/model/growingSetup/types";
import {useEffect, useState} from "react";
import {growingSetupsService} from "~/services/growingSetupsService";

type GrowingSetupCardProps = {
    setupId: number;
  locationName: string;
};

export default function GrowingSetupCard({
                                             setupId,
  locationName,
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
      <h1>{locationName}</h1>

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