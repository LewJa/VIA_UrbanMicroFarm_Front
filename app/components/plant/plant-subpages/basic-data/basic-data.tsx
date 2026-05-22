import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router";
import { sensorService} from "~/services/sensorService";
import { growingSetupsService } from "~/services/growingSetupsService";
import type { SensorReading} from "~/model/sensor/types";
import type { SetupReading } from "~/model/growingSetup/types";
import type { PlantContext} from "~/components/plant/plant-subpages/plant-layout";
import { DropIcon } from "~/components/icons/icons-specific/Drop";
import { TagIcon } from "~/components/icons/icons-specific/TagIcon";
import { ClockIcon } from "~/components/icons/icons-specific/ClockIcon";
import { ThermometerIcon } from "~/components/icons/icons-specific/Thermometer";
import { SunIcon } from "~/components/icons/icons-specific/Sun";

type MetricKey = "moisture" | "temperature" | "humidity" | "light";

interface MetricConfig {
    key: MetricKey;
    label: string;
    shortLabel: string;
    unit: string;
    min: number;
    max: number;
    target: string;
    accent: string;
    icon: React.ReactNode;
    status: (v: number) => { label: string; cls: string; barColor: string };
}

const METRICS: MetricConfig[] = [
    {
        key: "moisture",
        label: "Soil moisture",
        shortLabel: "Moisture",
        unit: "%",
        min: 0,
        max: 100,
        target: "target 50–75%",
        accent: "var(--color-mf-forest)",
        icon: <DropIcon />,
        status: (v) => {
            if (v < 30) return { label: "Dry", cls: "mf-chip-err", barColor: "var(--color-mf-err)" };
            if (v < 45) return { label: "Getting dry", cls: "mf-chip-warn", barColor: "var(--color-mf-warn)" };
            if (v > 80) return { label: "Saturated", cls: "mf-chip-water", barColor: "var(--color-mf-water)" };
            return { label: "Good", cls: "mf-chip-ok", barColor: "var(--color-mf-forest)" };
        },
    },
    {
        key: "temperature",
        label: "Temperature",
        shortLabel: "Temp",
        unit: "°C",
        min: 0,
        max: 40,
        target: "target 18–26°C",
        accent: "var(--color-mf-clay)",
        icon: <ThermometerIcon />,
        status: (v) => {
            if (v < 12) return { label: "Cold", cls: "mf-chip-water", barColor: "var(--color-mf-water)" };
            if (v < 18) return { label: "Cool", cls: "mf-chip-warn", barColor: "var(--color-mf-warn)" };
            if (v > 30) return { label: "Hot", cls: "mf-chip-err", barColor: "var(--color-mf-err)" };
            if (v > 26) return { label: "Warm", cls: "mf-chip-warn", barColor: "var(--color-mf-warn)" };
            return { label: "Comfortable", cls: "mf-chip-ok", barColor: "var(--color-mf-forest)" };
        },
    },
    {
        key: "humidity",
        label: "Humidity",
        shortLabel: "Humidity",
        unit: "%",
        min: 0,
        max: 100,
        target: "target 40–70%",
        accent: "var(--color-mf-water)",
        icon: <DropIcon />,
        status: (v) => {
            if (v < 30) return { label: "Dry air", cls: "mf-chip-warn", barColor: "var(--color-mf-warn)" };
            if (v > 80) return { label: "Humid", cls: "mf-chip-water", barColor: "var(--color-mf-water)" };
            return { label: "Good", cls: "mf-chip-ok", barColor: "var(--color-mf-water)" };
        },
    },
    {
        key: "light",
        label: "Light",
        shortLabel: "Light",
        unit: "%",
        min: 0,
        max: 100,
        target: "target 60–90%",
        accent: "var(--color-mf-clay-2)",
        icon: <SunIcon />,
        status: (v) => {
            if (v < 20) return { label: "Dark", cls: "mf-chip-err", barColor: "var(--color-mf-err)" };
            if (v < 40) return { label: "Low light", cls: "mf-chip-warn", barColor: "var(--color-mf-warn)" };
            return { label: "Bright", cls: "mf-chip-ok", barColor: "var(--color-mf-clay-2)" };
        },
    },
];

const adcToPercent = (v: number) => Math.round((v / 1023) * 100);

export default function BasicData() {
    const { setupId, sensorId, plantId } = useParams();
    const { plant } = useOutletContext<PlantContext>();

    const [moisture, setMoisture] = useState<SensorReading | null>(null);
    const [setupReading, setSetupReading] = useState<SetupReading | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeMetric, setActiveMetric] = useState<MetricKey>("moisture");

    useEffect(() => {
        if (!plantId || !setupId || !sensorId) return;
        const sensorIdNumber = parseInt(sensorId);
        const setupIdNumber = parseInt(setupId);
        setLoading(true);
        setError(null);

        Promise.allSettled([
            sensorService.getLatestReading(sensorIdNumber),
            growingSetupsService.getSetupSensorReadings(setupIdNumber),
        ])
            .then(([moistureRes, setupRes]) => {
                if (moistureRes.status === "fulfilled") setMoisture(moistureRes.value);
                else if ((moistureRes.reason as any)?.response?.status !== 404) {
                    console.error("Failed to fetch moisture reading:", moistureRes.reason);
                }
                if (setupRes.status === "fulfilled") setSetupReading(setupRes.value);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load sensor data.");
                setLoading(false);
            });
    }, [plantId, setupId, sensorId]);

    function getMetricValue(key: MetricKey): number | null {
        switch (key) {
            case "moisture":
                return moisture ? adcToPercent(moisture.value) : null;
            case "temperature":
                return setupReading?.temperature ?? null;
            case "humidity":
                return setupReading?.humidity ?? null;
            case "light":
                return setupReading?.light != null ? Math.round(setupReading.light / 10.23) : null;
        }
    }

    if (loading) return <SkeletonGrid />;

    if (error) {
        return (
            <div className="mf-card p-5 border-[#E9C3B5] bg-[#F4DBD2]/40 text-mf-ink-2 text-sm">
                {error}
            </div>
        );
    }

    const metric = METRICS.find((m) => m.key === activeMetric)!;
    const value = getMetricValue(activeMetric);
    const status = value != null ? metric.status(value) : null;
    const pctOfRange =
        value != null
            ? Math.min(100, Math.max(0, ((value - metric.min) / (metric.max - metric.min)) * 100))
            : 0;

    const isMoisture = activeMetric === "moisture";
    const sourceLabel = isMoisture ? `Sensor #${moisture?.sensorId ?? "—"}` : "Setup readings";
    const sourceRaw = isMoisture && moisture ? `raw value · ${moisture.value}` : null;
    const sourceTs = isMoisture
        ? moisture?.timestamp ? new Date(moisture.timestamp) : null
        : new Date();

    return (
        <div className="flex flex-col gap-5">
            {/* ── Overview tiles ──────────────────────────────────── */}
            <section>
                <p className="mf-small-text mb-2.5">At a glance · tap to inspect</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {METRICS.map((m) => {
                        const v = getMetricValue(m.key);
                        const stat = v != null ? m.status(v) : null;
                        const active = m.key === activeMetric;
                        const available = v != null;
                        return (
                            <button
                                key={m.key}
                                type="button"
                                disabled={!available}
                                onClick={() => setActiveMetric(m.key)}
                                aria-pressed={active}
                                className={[
                                    "relative text-left rounded-mf-lg p-3.5 border bg-mf-card",
                                    "transition-[transform,box-shadow,border-color] duration-150",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    active
                                        ? "border-transparent shadow-mf-2 -translate-y-[1px]"
                                        : "border-mf-line hover:border-mf-line-2 hover:shadow-mf-1",
                                ].join(" ")}
                                style={active ? { boxShadow: `0 0 0 2px ${m.accent}, var(--shadow-mf-1)` } : undefined}
                            >
                                {/* Accent strip on active */}
                                {active && (
                                    <span
                                        aria-hidden
                                        className="absolute top-0 left-3.5 right-3.5 h-[2px] rounded-b-full"
                                        style={{ background: m.accent }}
                                    />
                                )}

                                {/* Label + icon */}
                                <div className="flex items-center justify-between text-mf-ink-3 mb-1.5">
                  <span className="text-[10px] uppercase tracking-[.10em] font-medium">
                    {m.shortLabel}
                  </span>
                                    <span style={{ color: active ? m.accent : "var(--color-mf-ink-4)" }}>
                    {m.icon}
                  </span>
                                </div>

                                {/* Value */}
                                {v != null ? (
                                    <div className="flex items-baseline gap-0.5">
                    <span
                        className="font-serif text-3xl sm:text-4xl leading-none tracking-tight"
                        style={{ color: active ? m.accent : "var(--color-mf-ink)" }}
                    >
                      {v}
                    </span>
                                        <span className="font-serif text-sm text-mf-ink-3">{m.unit}</span>
                                    </div>
                                ) : (
                                    <span className="font-mono text-xs text-mf-ink-4">no data</span>
                                )}

                                {/* Status microline */}
                                {stat ? (
                                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-mf-ink-3">
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: stat.barColor }}
                    />
                                        {stat.label}
                                    </div>
                                ) : (
                                    <div className="h-[18px] mt-2" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── Detail card for the active metric ───────────────── */}
            <article
                className="mf-card p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden"
                aria-live="polite"
            >
                {/* Top accent ribbon tying card to the active tile */}
                <span
                    aria-hidden
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ background: metric.accent }}
                />

                <header className="flex items-start justify-between gap-4">
                    <div>
                        <p className="mf-eyebrow flex items-center gap-1.5">
                            <span style={{ color: metric.accent }}>{metric.icon}</span>
                            {metric.label}
                        </p>
                        <p className="mt-1 text-sm text-mf-ink-3">
                            {plant ? <>Latest reading from {plant.name}</> : "Latest reading"}
                        </p>
                    </div>
                    {status && (
                        <span className={`mf-chip ${status.cls}`}>
              <span className="mf-chip-dot" />
                            {status.label}
            </span>
                    )}
                </header>

                {/* Big value */}
                {value != null ? (
                    <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-5xl sm:text-6xl leading-none tracking-tight text-mf-ink">
              {value}
            </span>
                        <span className="font-serif text-2xl text-mf-ink-3">{metric.unit}</span>
                    </div>
                ) : (
                    <p className="text-sm text-mf-ink-3 italic">
                        No {metric.label.toLowerCase()} reading available.
                    </p>
                )}

                {/* Range bar */}
                {value != null && status && (
                    <div>
                        <div className="h-2 bg-mf-line rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-[width] duration-500"
                                style={{ width: `${pctOfRange}%`, background: status.barColor }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-mf-ink-4 mt-1.5 tracking-wider uppercase">
              <span>
                {metric.min}
                  {metric.unit}
              </span>
                            <span>{metric.target}</span>
                            <span>
                {metric.max}
                                {metric.unit}
              </span>
                        </div>
                    </div>
                )}
            </article>

            {/* ── Meta strip ───────────────────────────────────────── */}
            <article className="mf-card overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-mf-line">
                    <MetaRow icon={<TagIcon />} label="Source" value={sourceLabel} />
                    <MetaRow
                        icon={<ClockIcon />}
                        label="Recorded"
                        value={
                            sourceTs
                                ? sourceTs.toLocaleString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })
                                : "—"
                        }
                    />
                </div>
                {sourceRaw && (
                    <div className="border-t border-mf-line px-5 py-3 flex items-center justify-between text-xs text-mf-ink-3">
                        <span className="font-mono">{sourceRaw}</span>
                    </div>
                )}
            </article>
        </div>
    );
}

/* ── Helpers ──────────────────────────────────────────────── */

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 text-mf-ink-3 mb-1">
                {icon}
                <span className="text-[10px] uppercase tracking-[.10em] font-medium">{label}</span>
            </div>
            <div className="font-serif text-lg text-mf-ink tracking-tight">{value}</div>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="mf-card p-3.5">
                        <div className="h-2 w-12 bg-mf-line rounded-full animate-pulse mb-3" />
                        <div className="h-7 w-14 bg-mf-line/70 rounded-mf-sm animate-pulse" />
                        <div className="h-2 w-16 bg-mf-line rounded-full animate-pulse mt-3" />
                    </div>
                ))}
            </div>
            <div className="mf-card p-5">
                <div className="h-3 w-24 bg-mf-line rounded-full animate-pulse mb-4" />
                <div className="h-10 w-32 bg-mf-line/70 rounded-mf-sm animate-pulse" />
            </div>
        </div>
    );
}
