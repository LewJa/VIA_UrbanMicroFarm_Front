import type {SetupReading} from "~/model/growingSetup/types";
import type {Plant} from "~/model/plant/types";
import {useEffect, useState} from "react";
import {growingSetupsService} from "~/services/growingSetupsService";
import {MoreDotsIcon} from "~/components/icons/icons-specific/MoreDots";
import ReadingTile from "~/components/growingSetup/ReadingTile";
import {getPlantsBySetup} from "~/services/plantsService";
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
    const [setupReadings, setSetupReadings] = useState<SetupReading | undefined>(undefined);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [sensors, setSensors] = useState<any[]>([]);

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [readings, fetchedPlants, fetchedSensors] = await Promise.all([
                    growingSetupsService.getSetupSensorReadings(setupId).catch(() => undefined),
                    getPlantsBySetup(setupId).catch(() => []),
                    growingSetupsService.fetchAllAssignedSensors(setupId).catch(() => [])
                ]);

                if (!cancelled) {
                    setSetupReadings(readings);
                    setPlants(fetchedPlants);
                    setSensors(fetchedSensors);
                    setReadingsError(null);
                }
            } catch (e: any) {
                if (!cancelled) setReadingsError(e?.message ?? "Failed to load setup data");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };

    }, [setupId]);

    const sensorLabel = sensors.length > 0 ? `sensor #${sensors[0].id}` : "no sensors";
    const plantCount = plants.length;
    const plantLabel = plantCount === 1 ? "1 plant" : `${plantCount} plants`;

    const slots = Array.from({ length: Math.max(sensors.length, 1) }, (_, index) => {
        const plant = plants[index];
        if (plant) {
            return (
                <div key={plant.id || index} className="mf-photo mf-photo-leaf h-24 sm:h-32 relative rounded-mf-md">
                    <span className="opacity-70">{plant.name || plant.type}</span>
                </div>
            );
        }
        return (
            <div key={`empty-${index}`} className="w-full min-h-20 relative overflow-hidden flex items-center justify-center font-mono text-[11px] uppercase tracking-[.04em] rounded-mf-md border border-dashed border-mf-line-2 bg-mf-cream/30 text-mf-line-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
        );
    });

    return (
        <Link to={`/setup/${setupId}`} state={{ location: locationName, status: status ?? "" }}
              className="mf-card overflow-hidden flex flex-col group hover:shadow-mf-2 transition-shadow">

            <div className="p-5 flex flex-col gap-4 flex-1">
                <header className="flex items-start justify-between gap-3 mb-0">
                    <div>
                        <p className="mf-eyebrow">Setup #{setupId}</p>
                        <h2 className="mf-h2 text-xl mt-0.5 text-mf-ink">{locationName}</h2>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Math.max(sensors.length, 1), 2)}, 1fr)` }} className="gap-2.5">
                    {slots}
                </div>

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
                            value={Math.round(setupReadings.light / 10.23)}
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
