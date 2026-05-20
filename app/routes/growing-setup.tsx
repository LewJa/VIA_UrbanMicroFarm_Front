import { useParams, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { growingSetupsService } from "~/services/growingSetupsService";
import { getPlantsBySetup } from "~/services/plantsService";
import { AddPlantModal } from "~/components/plant/add-plant-popup/add-plant-popup";
import { wateringService } from "~/services/wateringService";
import type { GrowingSetup, SetupReading, MoistureSensor } from "~/model/growingSetup/types";
import type { Plant } from "~/model/plant/types";

import { ThermometerIcon } from "~/components/icons/icons-specific/Thermometer";
import { DropIcon } from "~/components/icons/icons-specific/Drop";
import { SunIcon } from "~/components/icons/icons-specific/Sun";
import { MoreDotsIcon } from "~/components/icons/icons-specific/MoreDots";

const HARDCODED_USER_ID = 1;

type PageStatus = "loading" | "error" | "success";

export default function GrowingSetupPage() {
    const { setupId } = useParams<{ setupId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const id = Number(setupId);
    const navState = location.state as { location?: string; status?: string } | null;
    const navLocation = navState?.location;
    const navStatus = navState?.status;

    const [setup, setSetup] = useState<GrowingSetup | null>(null);
    const [reading, setReading] = useState<SetupReading | null>(null);
    const [sensors, setSensors] = useState<MoistureSensor[]>([]);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const [activeTab, setActiveTab] = useState("Plants");
    const [isWatering, setIsWatering] = useState(false);

    useEffect(() => {
        let alive = true;
        setPageStatus("loading");
        setErrorMessage("");

        const setupFetch: Promise<GrowingSetup> = navLocation
            ? Promise.resolve({ id, location: navLocation, status: navStatus ?? "", sensorSlots: 4 } as GrowingSetup)
            : growingSetupsService
                .getSetupById(id, HARDCODED_USER_ID)
                .then((s) => s ?? { id, location: "Setup #$id", status: "", sensorSlots: 4 } as GrowingSetup);

        Promise.all([
            growingSetupsService.getSetupSensorReadings(id),
            growingSetupsService.fetchAllAssignedSensors(id),
            getPlantsBySetup(id),
            setupFetch,
        ])
            .then(([readingData, sensorData, plantData, setupData]) => {
                if (!alive) return;
                setReading(readingData);
                setSensors(sensorData);
                setPlants(plantData);
                setSetup(setupData);
                setPageStatus("success");
            })
            .catch((err: any) => {
                if (!alive) return;
                const axiosErr = err;
                const httpStatus = axiosErr?.response?.status;
                if (httpStatus === 401 || httpStatus === 403) {
                    setErrorMessage("You don't have permission to view this growing setup.");
                } else {
                    setErrorMessage(axiosErr?.response?.data?.error?.message ?? "Failed to load setup data.");
                }
                setPageStatus("error");
            });

        return () => {
            alive = false;
        };
    }, [id, retryCount, navLocation, navStatus]);

    const handlePlantAdded = () => {
        getPlantsBySetup(id).then(setPlants).catch(() => {});
    };

    const handleManualWatering = async () => {
        if (!plants.length) {
            alert("No plants to water in this setup.");
            return;
        }
        try {
            setIsWatering(true);
            await wateringService.triggerManualWatering(plants[0].id);
            alert("Watering triggered successfully!");
        } catch (error) {
            alert("Failed to trigger watering.");
        } finally {
            setIsWatering(false);
        }
    };

    if (pageStatus === "loading") {
        return (
            <div className="flex items-center justify-center min-h-64" aria-busy="true">
                <p className="text-gray-500">Loading…</p>
            </div>
        );
    }

    if (pageStatus === "error") {
        return (
            <div className="m-6 p-6 rounded-2xl border-2 border-dashed border-red-200 bg-red-50">
                <h2 className="font-bold text-red-900">Error</h2>
                <p className="text-sm mt-1">{errorMessage}</p>
                <button
                    className="mt-3 rounded-2xl py-1 px-4 bg-red-900 text-gray-100 text-sm"
                    onClick={() => setRetryCount((c) => c + 1)}
                >
                    Retry
                </button>
            </div>
        );
    }

    const maxSlots = setup?.sensorSlots;
    const locationName = setup?.location ?? `Setup #${id}`;

    return (
        <div className="px-4 sm:px-6 xl:px-12 w-full max-w-150 lg:max-w-full lg:mx-auto">
            <div className="lg:grid lg:grid-cols-2 lg:gap-10 mb-6 lg:mb-10">
                <div className="w-full aspect-16/10 sm:aspect-video lg:aspect-auto lg:h-full rounded-3xl mf-photo-leaf flex items-center justify-center mb-6 lg:mb-0 min-h-50">
                    <span className="text-[#6b8a4d]/70 font-mono tracking-widest text-xs font-bold">{setup?.location.toUpperCase()}</span>
                </div>

                <div className="flex flex-col justify-center">
                    <h2 className="font-serif text-[32px] sm:text-[40px] tracking-tight text-[#1a2119] mb-4">
                        {locationName}
                    </h2>

                    <div className="rounded-[20px] bg-white border border-[#e6dfce] p-5 shadow-sm">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[#a8a492] mb-3">Live Readings</div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#a8a492]">
                                    <ThermometerIcon />
                                    <span>Temp</span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-1.5 text-[#1a2119]">
                                    <span className="font-bold text-[22px] sm:text-[24px]">{reading?.temperature ?? "--"}</span>
                                    <span className="text-[13px] font-bold">&deg;</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#a8a492]">
                                    <DropIcon />
                                    <span>Humidity</span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-1.5 text-[#1a2119]">
                                    <span className="font-bold text-[22px] sm:text-[24px]">{reading?.humidity ?? "--"}</span>
                                    <span className="text-[13px] font-bold">%</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#a8a492]">
                                    <SunIcon />
                                    <span>Light</span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-1.5 text-[#1a2119]">
                                    <span className="font-bold text-[22px] sm:text-[24px]">{reading?.light ? Math.round(reading.light / 10.23) : "--"}</span>
                                    <span className="text-[13px] font-bold">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex w-full lg:grid lg:grid-cols-2 lg:gap-10 mb-6 lg:mb-10">
                <div className="mf-tabs w-full flex h-11">
                    {["Plants", "Details", "Sensors"].map(tab => (
                        <button
                            key={tab}
                            className={`mf-tab transition-colors flex-1 ${activeTab === tab ? "bg-white text-[#1a2119] shadow-sm font-semibold" : "text-[#7a7768] hover:text-[#1a2119]"}`}
                            aria-selected={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="lg:flex lg:gap-10">
                <div className="flex-1">
                    {activeTab === "Plants" && (
                        <>
                            <div className="flex items-center justify-between mb-5 lg:mb-6">
                                <div className="text-[11px] sm:text-[12px] uppercase tracking-widest text-[#a8a492] font-semibold">
                                    {plants.length} OF {maxSlots} SLOTS OCCUPIED
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-10">
                                {plants.map((plant, index) => {
                                    const statusList = ["ok", "ok", "water", "check", "ok"];
                                    const currentStatus = statusList[index % statusList.length];

                                    return (
                                        <div key={plant.id} onClick={() => navigate(`/setup/${id}/sensor/${plant.sensorId ?? 1}/plant/${plant.id}`)} className="mf-card p-3 sm:p-4 flex items-center justify-between hover:shadow-mf-2 transition-shadow cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-xl mf-photo-leaf flex text-center px-1">
                                                    <span className="text-[#6b8a4d]/75 text-[9px] font-bold tracking-widest leading-tight mt-auto mb-auto">PLANT<br/>PHOTO</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-serif font-bold text-[18px] sm:text-[20px] text-[#1a2119] capitalize">{plant.name}</span>
                                                    <span className="text-[11px] uppercase tracking-widest text-[#a8a492] font-semibold mt-0.5">slot {index + 1}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 md:gap-4 pr-1 sm:pr-2">
                                                {currentStatus === "water" ? (
                                                    <div className="mf-chip mf-chip-warn px-2.5 py-1.5 h-auto">
                                                        <div className="mf-chip-dot"></div>
                                                        <span className="text-[12px] font-bold tracking-wide pl-1">water</span>
                                                    </div>
                                                ) : currentStatus === "check" ? (
                                                    <div className="mf-chip mf-chip-err px-2.5 py-1.5 h-auto">
                                                        <div className="mf-chip-dot"></div>
                                                        <span className="text-[12px] font-bold tracking-wide pl-1">check</span>
                                                    </div>
                                                ) : (
                                                    <div className="mf-chip mf-chip-ok px-2.5 py-1.5 h-auto">
                                                        <div className="mf-chip-dot"></div>
                                                        <span className="text-[12px] font-bold tracking-wide pl-1">ok</span>
                                                    </div>
                                                )}
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8a492" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                            </div>
                                        </div>
                                    );
                                })}

                                {plants.length >= 0 && (
                                    <div className="rounded-[16px] border-[1.5px] border-dashed border-[#d9cfb8] bg-[#FAF6EE] hover:bg-white p-3 sm:p-4 flex items-center justify-between hover:border-[#b89968] transition-colors cursor-pointer group" onClick={() => setIsModalOpen(true)}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-xl border border-dashed border-[#d9cfb8] bg-white flex items-center justify-center text-[#d9cfb8] group-hover:border-[#b89968] group-hover:text-[#b89968] transition-colors">
                                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" width="22" height="22"><path d="M12 5v14M5 12h14"/></svg>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-serif font-bold text-[18px] sm:text-[20px] text-[#1a2119]">Empty slot</span>
                                                <span className="text-[11px] uppercase tracking-widest text-[#a8a492] font-semibold mt-0.5">slot {plants.length + 1}</span>
                                            </div>
                                        </div>
                                        <div className="pr-3 sm:pr-4 text-[13px] font-bold text-[#8a6f4a]">
                                            Add plant
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {activeTab === "Details" && (
                        <div className="p-8 text-center text-[#a8a492] font-medium border border-dashed border-[#d9cfb8] rounded-[16px]">
                            Details section coming soon...
                        </div>
                    )}
                    {activeTab === "Sensors" && (
                        <div className="p-8 text-center text-[#a8a492] font-medium border border-dashed border-[#d9cfb8] rounded-[16px]">
                            Sensors section coming soon...
                        </div>
                    )}
                </div>

                <div className="hidden lg:block w-[320px] shrink-0 space-y-5">
                    <div className="mf-card p-6 border-[#e6dfce] bg-transparent shadow-none">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[#a8a492] mb-4">Quick actions</div>
                        <div className="space-y-2.5">
                            <button onClick={() => setIsModalOpen(true)} className="w-full text-left bg-white border border-[#e6dfce] rounded-[14px] px-4 py-3.5 flex items-center gap-3.5 text-[14px] font-medium text-[#1a2119] hover:bg-[#FAF6EE] shadow-sm transition-colors">
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18" className="text-[#1a2119]"><path d="M12 5v14M5 12h14"/></svg>
                                Add plant
                            </button>
                            <button onClick={handleManualWatering} disabled={isWatering} className="w-full text-left bg-white border border-[#e6dfce] rounded-[14px] px-4 py-3.5 flex items-center gap-3.5 text-[14px] font-medium text-[#1a2119] hover:bg-[#FAF6EE] shadow-sm transition-colors disabled:opacity-50">
                                <DropIcon />
                                {isWatering ? "Watering..." : "Manual watering"}
                            </button>
                            <button onClick={() => alert("More options coming soon!")} className="w-full text-left bg-white border border-[#e6dfce] rounded-[14px] px-4 py-3.5 flex items-center gap-3.5 text-[14px] font-medium text-[#1a2119] hover:bg-[#FAF6EE] shadow-sm transition-colors">
                                <MoreDotsIcon />
                                Edit location & nickname
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <AddPlantModal
                    setupId={id}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onContinue={handlePlantAdded}
                />
            )}
        </div>
    );
}
