import type {SetupReading} from "~/model/growingSetup/types";
import {useEffect, useState} from "react";
import {growingSetupsService} from "~/services/growingSetupsService";
import {MoreDotsIcon} from "~/components/icons/icons-specific/MoreDots";
import ReadingTile from "~/components/growingSetup/ReadingTile";
import {ThermometerIcon} from "~/components/icons/icons-specific/Thermometer";
import {DropIcon} from "~/components/icons/icons-specific/Drop";
import {SunIcon} from "~/components/icons/icons-specific/Sun";
import {Link} from "react-router";

type GrowingSetupCardProps = {
    setupId: number;
    locationName: string;
    status?: string;
};

export default function GrowingSetupCard({ setupId, locationName, status }: GrowingSetupCardProps) {

    const [loading, setLoading] = useState(true);
    const [readingsError, setReadingsError] = useState<string | null>(null);
    const [setupReadings, setSetupReadings] = useState<SetupReading | undefined>(undefined)

    useEffect(() => {
        let cancelled = false;

        const fetchReadings = async () => {
            try {
                setLoading(true);
                const readings = await growingSetupsService.getSetupSensorReadings(setupId);
                if (!cancelled) {
                    setSetupReadings(readings);
                    setReadingsError(null);
                }
            } catch (e: any) {
                if (!cancelled) setReadingsError(e?.message ?? "Failed to load readings");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchReadings();

        return () => {
            cancelled = true;
        };

    }, [setupId]);


  return (
    <Link to={`/setup/${setupId}`} state={{ location: locationName, status: status ?? "" }}
                className="mf-card overflow-hidden flex flex-col group hover:shadow-mf-2 transition-shadow">
        <div className="mf-photo mf-photo-leaf h-32 relative">
            <span className="opacity-70">{locationName.toLowerCase()}</span>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1">
            <header className="flex items-start justify-between gap-3">
                <div>
                    <p className="mf-eyebrow">Setup #{setupId}</p>
                    <h2 className="mf-h2 text-xl mt-0.5 text-mf-ink">{locationName}</h2>
                </div>
            </header>

            {loading ? (
                <div className="text-sm text-mf-ink-2 border-mf-line pt-4">
                    Loading...
                </div>
            ) : readingsError ? (
                <div className="text-sm text-mf-ink-2 bg-[#F4DBD2]/40 border border-[#E9C3B5] rounded-mf-md px-3 py-2">
                    Couldn't load sensor data.
                </div>
            ) : setupReadings ? (
                <div className="grid grid-cols-3 divide-x divide-mf-line border-t border-mf-line -mx-5 px-5 pt-1">
                    <ReadingTile
                        icon={<ThermometerIcon />}
                        label="Temp"
                        value={setupReadings.temperature}
                        unit="°C"
                        tone="sun"
                    />
                    <ReadingTile
                        icon={<DropIcon />}
                        label="Humidity"
                        value={setupReadings.humidity}
                        unit="%"
                        tone="water"
                    />
                    {/* TODO: confirm whether to surface as lux once IoT publishes a conversion */}
                    <ReadingTile
                        icon={<SunIcon />}
                        label="Light"
                        value={setupReadings.light/1023}
                        unit="%"
                        tone="leaf"
                    />
                </div>
            ) : (
                <div className="text-sm text-mf-ink-3 italic">No readings available yet.</div>
            )}
        </div>
    </Link>
  );
}