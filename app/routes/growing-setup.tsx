import { useParams, useLocation, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { growingSetupsService } from "~/services/growingSetupsService";
import { getPlantsBySetup, updatePlantPhoto } from "~/services/plantsService";
import { AddPlantModal } from "~/components/plant/add-plant-popup/add-plant-popup";
import { wateringService } from "~/services/wateringService";
import type { GrowingSetup, SetupReading, MoistureSensor } from "~/model/growingSetup/types";
import type { Plant } from "~/model/plant/types";
import { useAuth } from "~/context/AuthContext";

import { ThermometerIcon } from "~/components/icons/icons-specific/Thermometer";
import { DropIcon } from "~/components/icons/icons-specific/Drop";
import { SunIcon } from "~/components/icons/icons-specific/Sun";
import { MoreDotsIcon } from "~/components/icons/icons-specific/MoreDots";

type PageStatus = "loading" | "error" | "success";

export default function GrowingSetupPage() {
    const { setupId } = useParams<{ setupId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

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
    const [isConfirmWateringOpen, setIsConfirmWateringOpen] = useState(false);
    const [wateringMessage, setWateringMessage] = useState<{ text: string; ok: boolean } | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editLocation, setEditLocation] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let alive = true;
        setPageStatus("loading");
        setErrorMessage("");

        const userId = user?.id;

        const setupFetch: Promise<GrowingSetup> = navLocation
            ? Promise.resolve({ id, location: navLocation, status: navStatus ?? "", sensorSlots: 4 } as GrowingSetup)
            : growingSetupsService
                .getSetupById(id, userId!)
                .then((s) => s ?? { id, location: `Setup #${id}`, status: "", sensorSlots: 4 } as GrowingSetup);

        const readingsFetch = growingSetupsService.getSetupSensorReadings(id).catch(() => null);
        const sensorsFetch = growingSetupsService.fetchAllAssignedSensors(id).catch(() => []);

        Promise.all([
            readingsFetch,
            sensorsFetch,
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
                const httpStatus = err?.response?.status;
                if (httpStatus === 401 || httpStatus === 403) {
                    setErrorMessage("You don't have permission to view this growing setup.");
                } else {
                    setErrorMessage(err?.response?.data?.error?.message ?? "Failed to load setup data.");
                }
                setPageStatus("error");
            });

        return () => {
            alive = false;
        };
    }, [id, retryCount, navLocation, navStatus, user?.id]);

    const handlePlantAdded = () => {
        getPlantsBySetup(id).then(setPlants).catch(() => {});
    };

    const handleSaveLocation = async () => {
        const trimmed = editLocation.trim();
        if (!trimmed) return;
        setIsSaving(true);
        try {
            await growingSetupsService.updateSetupLocation(id, trimmed);
            setSetup((prev) => prev ? { ...prev, location: trimmed } : prev);
            setIsEditOpen(false);
        } catch {
            // keep modal open so user can retry
        } finally {
            setIsSaving(false);
        }
    };

    const photoInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const handlePhotoUpload = (plantId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const base64 = evt.target?.result as string;
            try {
                await updatePlantPhoto(plantId, base64);
                setPlants(prev => prev.map(p => p.id === plantId ? { ...p, photo: base64 } : p));
            } catch {}
        };
        reader.readAsDataURL(file);
    };

    const handleManualWatering = async () => {
        if (!plants.length) {
            setWateringMessage({ text: "No plants to water in this setup.", ok: false });
            return;
        }
        setIsConfirmWateringOpen(false);
        setIsWatering(true);
        setWateringMessage(null);
        try {
            await wateringService.triggerManualWatering(plants[0].id);
            setWateringMessage({ text: "Watering triggered successfully!", ok: true });
            setTimeout(() => setWateringMessage(null), 3000);
        } catch {
            setWateringMessage({ text: "Failed to trigger watering.", ok: false });
            setTimeout(() => setWateringMessage(null), 3000);
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
            <div className="m-6 p-6 rounded-2xl border border-dashed border-mf-err/30 bg-mf-err/10">
                <h2 className="font-serif font-semibold text-mf-err">Something went wrong</h2>
                <p className="text-sm mt-1 text-mf-ink-2">{errorMessage}</p>
                <button
                    className="mt-4 mf-btn mf-btn-primary"
                    onClick={() => setRetryCount((c) => c + 1)}
                >
                    Retry
                </button>
            </div>
        );
    }

    const maxSlots = setup?.sensorSlots || sensors.length || undefined;
    const locationName = setup?.location ?? `Setup #${id}`;

    return (
        <div className="px-4 sm:px-6 xl:px-12 w-full max-w-150 lg:max-w-full lg:mx-auto">
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 mb-5 text-[13px] font-medium text-mf-ink-3 hover:text-mf-ink transition-colors"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Home
            </button>
            <div className="lg:grid lg:grid-cols-2 lg:gap-10 mb-6 lg:mb-10">
                <div className="w-full aspect-16/10 sm:aspect-video lg:aspect-auto lg:h-full rounded-3xl mf-photo-leaf flex items-center justify-center mb-6 lg:mb-0 min-h-50">
                    <span className="text-[#6b8a4d]/70 font-mono tracking-widest text-xs font-bold">{setup?.location.toUpperCase()}</span>
                </div>

                <div className="flex flex-col justify-center">
                    <h2 className="font-serif text-[32px] sm:text-[40px] tracking-tight text-mf-ink mb-4">
                        {locationName}
                    </h2>

                    <div className="rounded-[20px] bg-mf-card border border-mf-line p-5 shadow-mf-1">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-mf-ink-4 mb-3">Live Readings</div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-mf-ink-4">
                                    <ThermometerIcon />
                                    <span>Temp</span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-1.5 text-mf-ink">
                                    <span className="font-bold text-[18px] sm:text-[22px]">{reading?.temperature ?? "--"}</span>
                                    <span className="text-[11px] sm:text-[13px] font-bold">&deg;</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-mf-ink-4">
                                    <DropIcon />
                                    <span>Humidity</span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-1.5 text-mf-ink">
                                    <span className="font-bold text-[18px] sm:text-[22px]">{reading?.humidity ?? "--"}</span>
                                    <span className="text-[11px] sm:text-[13px] font-bold">%</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-mf-ink-4">
                                    <SunIcon />
                                    <span>Light</span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-1.5 text-mf-ink">
                                    <span className="font-bold text-[18px] sm:text-[22px]">{reading?.light ? Math.round(reading.light / 10.23) : "--"}</span>
                                    <span className="text-[11px] sm:text-[13px] font-bold">%</span>
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
                            className={`mf-tab transition-colors flex-1 ${activeTab === tab ? "bg-mf-card text-mf-ink shadow-mf-1 font-semibold" : "text-mf-ink-3 hover:text-mf-ink"}`}
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
                                <div className="text-[11px] sm:text-[12px] uppercase tracking-widest text-mf-ink-4 font-semibold">
                                    {plants.length} OF {maxSlots} SLOTS OCCUPIED
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-10">
                                {plants.map((plant, index) => {
                                    const currentStatus = plant.health ?? "unknown";

                                    return (
                                        <div key={plant.id} className="mf-card p-3 sm:p-4 flex items-center justify-between hover:shadow-mf-2 transition-shadow">
                                            {/* Hidden file input — outside overflow-hidden so browser can open it */}
                                            <input
                                                ref={(el) => { photoInputRefs.current[plant.id] = el; }}
                                                type="file"
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                onChange={(e) => handlePhotoUpload(plant.id, e)}
                                            />
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-xl overflow-hidden flex-shrink-0 relative group focus:outline-none"
                                                    onClick={(e) => { e.stopPropagation(); photoInputRefs.current[plant.id]?.click(); }}
                                                    title="Upload plant photo"
                                                >
                                                    {plant.photo ? (
                                                        <>
                                                            <img src={plant.photo} alt={plant.name} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                                                                </svg>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full border-2 border-dashed border-mf-line-2 bg-mf-cream group-hover:border-mf-clay group-hover:bg-mf-card rounded-xl flex flex-col items-center justify-center gap-1 transition-colors">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-mf-ink-4 group-hover:text-mf-clay transition-colors">
                                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                                                            </svg>
                                                            <span className="text-[8px] font-bold uppercase tracking-wide text-mf-ink-4 group-hover:text-mf-clay transition-colors leading-none">Add</span>
                                                        </div>
                                                    )}
                                                </button>
                                                <div className="flex flex-col gap-0.5 cursor-pointer" onClick={() => navigate(`/setup/${id}/sensor/${plant.sensorId ?? 1}/plant/${plant.id}`)}>
                                                    <span className="font-serif font-bold text-[18px] sm:text-[20px] text-mf-ink capitalize">{plant.name}</span>
                                                    <span className="text-[11px] uppercase tracking-widest text-mf-ink-4 font-semibold mt-0.5">slot {index + 1}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 md:gap-4 pr-1 sm:pr-2 cursor-pointer" onClick={() => navigate(`/setup/${id}/sensor/${plant.sensorId ?? 1}/plant/${plant.id}`)}>
                                                {currentStatus === "water" ? (
                                                    <div className="mf-chip mf-chip-warn px-2.5 py-1.5 h-auto">
                                                        <div className="mf-chip-dot"></div>
                                                        <span className="text-[12px] font-bold tracking-wide pl-1">water</span>
                                                    </div>
                                                ) : currentStatus === "unknown" ? (
                                                    <div className="mf-chip px-2.5 py-1.5 h-auto bg-mf-line/30 text-mf-ink-4">
                                                        <span className="text-[12px] font-bold tracking-wide">no data</span>
                                                    </div>
                                                ) : (
                                                    <div className="mf-chip mf-chip-ok px-2.5 py-1.5 h-auto">
                                                        <div className="mf-chip-dot"></div>
                                                        <span className="text-[12px] font-bold tracking-wide pl-1">ok</span>
                                                    </div>
                                                )}
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-mf-ink-4"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                            </div>
                                        </div>
                                    );
                                })}

                                {plants.length >= 0 && (
                                    <div className="rounded-[16px] border-[1.5px] border-dashed border-mf-line-2 bg-mf-cream hover:bg-mf-card p-3 sm:p-4 flex items-center justify-between hover:border-mf-clay-2 transition-colors cursor-pointer group" onClick={() => setIsModalOpen(true)}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-xl border border-dashed border-mf-line-2 bg-mf-card flex items-center justify-center text-mf-line-2 group-hover:border-mf-clay-2 group-hover:text-mf-clay-2 transition-colors">
                                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" width="22" height="22"><path d="M12 5v14M5 12h14"/></svg>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-serif font-bold text-[18px] sm:text-[20px] text-mf-ink">Empty slot</span>
                                                <span className="text-[11px] uppercase tracking-widest text-mf-ink-4 font-semibold mt-0.5">slot {plants.length + 1}</span>
                                            </div>
                                        </div>
                                        <div className="pr-3 sm:pr-4 text-[13px] font-bold text-mf-clay">
                                            Add plant
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {activeTab === "Details" && (
                        <div className="mf-card p-5 flex flex-col gap-4 mb-10">
                            <div className="text-[10px] uppercase font-bold tracking-widest text-mf-ink-4 mb-1">Setup details</div>
                            <div className="flex justify-between items-center border-b border-mf-line pb-3">
                                <span className="text-[13px] text-mf-ink-3">Setup ID</span>
                                <span className="text-[14px] font-medium text-mf-ink">#{setup?.id}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-mf-line pb-3">
                                <span className="text-[13px] text-mf-ink-3">Location</span>
                                <span className="text-[14px] font-medium text-mf-ink">{setup?.location || "—"}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-mf-line pb-3">
                                <span className="text-[13px] text-mf-ink-3">Status</span>
                                <span className={`text-[13px] font-semibold uppercase tracking-wide ${setup?.status === "ACTIVE" ? "text-mf-forest" : "text-mf-ink-3"}`}>
                                    {setup?.status || "—"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-mf-line pb-3">
                                <span className="text-[13px] text-mf-ink-3">Plant slots</span>
                                <span className="text-[14px] font-medium text-mf-ink">{plants.length} / {maxSlots ?? "—"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[13px] text-mf-ink-3">Connected sensors</span>
                                <span className="text-[14px] font-medium text-mf-ink">{sensors.length}</span>
                            </div>
                        </div>
                    )}
                    {activeTab === "Sensors" && (
                        <div className="flex flex-col gap-3 mb-10">
                            {sensors.length === 0 ? (
                                <div className="p-8 text-center text-mf-ink-4 font-medium border border-dashed border-mf-line-2 rounded-[16px]">
                                    No sensors connected to this setup.
                                </div>
                            ) : (
                                sensors.map((sensor, i) => (
                                    <div key={sensor.id} className="mf-card p-4 flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[14px] font-medium text-mf-ink">Sensor #{sensor.id}</span>
                                            <span className="text-[11px] uppercase tracking-widest text-mf-ink-4 font-semibold">Slot {i + 1}</span>
                                        </div>
                                        {sensor.status === "Active" ? (
                                            <div className="mf-chip mf-chip-ok px-2.5 py-1.5 h-auto">
                                                <div className="mf-chip-dot"></div>
                                                <span className="text-[12px] font-bold tracking-wide pl-1">Active</span>
                                            </div>
                                        ) : (
                                            <div className="mf-chip px-2.5 py-1.5 h-auto bg-mf-line/30 text-mf-ink-4">
                                                <span className="text-[12px] font-bold tracking-wide">No data</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <div className="lg:hidden mt-6 mb-4">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-mf-ink-4 mb-3">Quick actions</div>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => setIsModalOpen(true)} className="mf-card flex flex-col items-center gap-2 py-4 px-2 text-[12px] font-medium text-mf-ink hover:bg-mf-cream transition-colors">
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20" className="text-mf-ink"><path d="M12 5v14M5 12h14"/></svg>
                                Add plant
                            </button>
                            <button onClick={() => setIsConfirmWateringOpen(true)} disabled={isWatering} className="mf-card flex flex-col items-center gap-2 py-4 px-2 text-[12px] font-medium text-mf-ink hover:bg-mf-cream transition-colors disabled:opacity-50">
                                <DropIcon />
                                {isWatering ? "Watering…" : "Water"}
                            </button>
                            <button onClick={() => { setEditLocation(setup?.location ?? ""); setIsEditOpen(true); }} className="mf-card flex flex-col items-center gap-2 py-4 px-2 text-[12px] font-medium text-mf-ink hover:bg-mf-cream transition-colors">
                                <MoreDotsIcon />
                                Edit
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block w-[320px] shrink-0 space-y-5">
                    <div className="mf-card p-6">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-mf-ink-4 mb-4">Quick actions</div>
                        <div className="space-y-2.5">
                            <button onClick={() => setIsModalOpen(true)} className="w-full text-left bg-mf-card border border-mf-line rounded-[14px] px-4 py-3.5 flex items-center gap-3.5 text-[14px] font-medium text-mf-ink hover:bg-mf-cream shadow-mf-1 transition-colors">
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18" className="text-mf-ink"><path d="M12 5v14M5 12h14"/></svg>
                                Add plant
                            </button>
                            <button onClick={() => setIsConfirmWateringOpen(true)} disabled={isWatering} className="w-full text-left bg-mf-card border border-mf-line rounded-[14px] px-4 py-3.5 flex items-center gap-3.5 text-[14px] font-medium text-mf-ink hover:bg-mf-cream shadow-mf-1 transition-colors disabled:opacity-50">
                                <DropIcon />
                                {isWatering ? "Watering…" : "Manual watering"}
                            </button>
                            <button onClick={() => { setEditLocation(setup?.location ?? ""); setIsEditOpen(true); }} className="w-full text-left bg-mf-card border border-mf-line rounded-[14px] px-4 py-3.5 flex items-center gap-3.5 text-[14px] font-medium text-mf-ink hover:bg-mf-cream shadow-mf-1 transition-colors">
                                <MoreDotsIcon />
                                Edit location & nickname
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isConfirmWateringOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-mf-card border border-mf-line rounded-[20px] p-7 w-[90%] max-w-sm text-center shadow-mf-3">
                        <h2 className="font-serif text-[22px] text-mf-ink mb-2">Confirm watering</h2>
                        <p className="text-[14px] text-mf-ink-2 mb-6">Are you sure you want to trigger manual watering for this setup?</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                className="mf-btn mf-btn-secondary"
                                onClick={() => setIsConfirmWateringOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="mf-btn mf-btn-primary disabled:opacity-50"
                                onClick={handleManualWatering}
                                disabled={isWatering}
                            >
                                {isWatering ? "Watering…" : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {wateringMessage && (
                <div className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-medium shadow-mf-2 z-50 ${wateringMessage.ok ? "bg-mf-forest text-[#F4EEDB]" : "bg-mf-err text-[#F4EEDB]"}`}>
                    {wateringMessage.text}
                </div>
            )}

            {isEditOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-mf-card border border-mf-line rounded-[20px] p-7 w-[90%] max-w-sm shadow-mf-3">
                        <h2 className="font-serif text-[22px] text-mf-ink mb-1">Edit location</h2>
                        <p className="text-[13px] text-mf-ink-3 mb-5">Update the location name for this growing setup.</p>
                        <input
                            type="text"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveLocation(); }}
                            className="w-full px-4 py-3 rounded-[12px] border border-mf-line bg-mf-bg text-mf-ink text-[14px] focus:outline-none focus:border-mf-clay mb-5"
                            placeholder="e.g. Greenhouse A"
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                className="mf-btn mf-btn-secondary"
                                onClick={() => setIsEditOpen(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                className="mf-btn mf-btn-primary disabled:opacity-50"
                                onClick={handleSaveLocation}
                                disabled={isSaving || !editLocation.trim()}
                            >
                                {isSaving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
