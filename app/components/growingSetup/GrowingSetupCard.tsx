import type {SetupReading} from "~/model/growingSetup/types";
import type {Plant} from "~/model/plant/types";
import {useEffect, useState} from "react";
import {growingSetupsService} from "~/services/growingSetupsService";
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

    const sensorLabel = sensors.length > 0 ? `sensor #${sensors[0].id}` : "no sensor";
    const plantCount = plants.length;
    const plantLabel = plantCount === 1 ? "1 plant" : `${plantCount} plants`;

    const slots = [0, 1, 2].map((index) => {
        const plant = plants[index];
        if (plant) {
            return (
                <div key={plant.id || index} className="w-full aspect-[4/3] rounded-mf-md bg-mf-leaf border border-[#6b8a4d] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20"></div>
                    <span className="relative z-10 text-[10px] font-bold tracking-widest text-[#2d4a2b] uppercase">{plant.name || plant.type}</span>
                </div>
            );
        }
        return (
            <div key={`empty-${index}`} className="w-full aspect-[4/3] rounded-mf-md border border-dashed border-[#d9cfb8] bg-[#f4eedb]/30 text-[#d9cfb8] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
        );
    });

    return (
        <Link to={`/setup/${setupId}`} state={{ location: locationName, status: status ?? "" }}
              className="mf-card p-5 flex flex-col gap-4 group hover:shadow-mf-2 transition-shadow">
            
            <header className="flex items-start justify-between">
                <div>
                    <h2 className="font-serif text-[22px] tracking-tight text-[#1a2119]">{locationName}</h2>
                    <p className="text-[13px] text-mf-ink-3 mt-1">
                        {plantLabel} &middot; {sensorLabel}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="mf-chip mf-chip-ok flex items-center gap-1.5 px-3 py-1 bg-[#e4efdb] text-[#3f6638] border-[#cce5be]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3f6638]"></div>
                        <span className="text-[11px] font-bold lowercase tracking-wide">{status || "healthy"}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-3 gap-2.5 mt-2">
                {slots}
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-5">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#a8a492]">
                            <ThermometerIcon />
                            <span>Temp</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1 text-[#1a2119]">
                            <span className="font-bold text-[17px]">{setupReadings?.temperature ?? "--"}</span>
                            <span className="text-[11px] font-bold">&deg;</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#a8a492]">
                            <DropIcon />
                            <span>Humidity</span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1 text-[#1a2119]">
                            <span className="font-bold text-[17px]">{setupReadings?.humidity ?? "--"}</span>
                            <span className="text-[11px] font-bold">%</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#a8a492]">
                            <SunIcon />
                            <span>Light</span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1 text-[#1a2119]">
                            <span className="font-bold text-[17px]">{setupReadings?.light ? Math.round(setupReadings.light / 10.23) : "--"}</span>
                            <span className="text-[11px] font-bold">%</span>
                        </div>
                    </div>
                </div>
                <div className="text-mf-ink-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </div>
        </Link>
    );
}
