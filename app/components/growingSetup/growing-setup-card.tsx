import { Link } from "react-router";
import type { SetupReading } from "~/model/growingSetup/types";
import { useEffect, useState } from "react";
import { growingSetupsService } from "~/services/growingSetupsService";

type GrowingSetupCardProps = {
  setupId: number;
  locationName: string;
  status?: string;
};

export default function GrowingSetupCard({ setupId, locationName, status }: GrowingSetupCardProps) {
  const [setupReadings, setSetupReadings] = useState<SetupReading | undefined>(undefined);

  useEffect(() => {
    growingSetupsService
      .getSetupSensorReadings(setupId)
      .then(setSetupReadings)
      .catch(() => setSetupReadings(undefined));
  }, [setupId]);

  return (
    <Link
      to={`/setup/${setupId}`}
      state={{ location: locationName, status: status ?? "" }}
      className="block"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer">
        <h2 className="font-semibold text-lg text-green-950">{locationName}</h2>
        {setupReadings ? (
          <dl className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>Temperature</dt>
              <dd>{setupReadings.temperature} °C</dd>
            </div>
            <div className="flex justify-between">
              <dt>Humidity</dt>
              <dd>{setupReadings.humidity} %</dd>
            </div>
            <div className="flex justify-between">
              <dt>Light</dt>
              {/* TODO: confirm whether to surface as lux once IoT publishes a conversion */}
              <dd>{setupReadings.light} / 1023</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No readings available</p>
        )}
      </div>
    </Link>
  );
}
