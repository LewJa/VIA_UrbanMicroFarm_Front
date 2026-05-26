import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { sensorService } from "~/services/sensorService";
import { wateringService } from "~/services/wateringService";
import type { SensorHistoricalReading } from "~/model/sensor/types";
import type { WateringEvent } from "~/model/growingSetup/types";

const COLOR = {
  moisture: "#3F6638", // mf-forest-2 — primary line
  area:     "rgba(63,102,56,.10)",
  grid:     "#E6DFCE", // mf-line
  axis:     "#A8A492", // mf-ink-4
  manual:   "#8A6F4A", // mf-clay (human action → warm)
  auto:     "#5A7B8C", // mf-water (system action → cool)
  card:     "#FFFFFF",
};

const MODE_LABELS: Record<WateringEvent["mode"], string> = {
  manual: "Manual",
  automatic: "Automatic",
};
const WATERING_COLOR: Record<WateringEvent["mode"], string> = {
  manual: COLOR.manual,
  automatic: COLOR.auto,
};

type Range = "7d" | "30d" | "90d";

const RANGES: { label: string; value: Range }[] = [
  { label: "7 days",  value: "7d"  },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];


interface Props {
  sensorId: number;
  plantName?: string;
  setupId?: number;
}
interface ChartPoint {
  time: number;
  moisture: number;
  timestamp: string;
  _wateringEvent?: WateringEvent;
}


function getRangeTimestamps(range: Range): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  if (range === "7d")  from.setDate(from.getDate() - 7);
  else if (range === "30d") from.setDate(from.getDate() - 30);
  else from.setDate(from.getDate() - 90);
  return { from: from.toISOString(), to: to.toISOString() };
}

function formatXTick(range: Range): (ts: number) => string {
  return (ts: number) => {
    const d = new Date(ts);
    if (range === "7d")
      return d.toLocaleDateString([], { weekday: "short", day: "numeric" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };
}

export default function SoilMoistureHistoryChart({ sensorId, plantName, setupId }: Props) {
  const [range, setRange] = useState<Range>("7d");
  const [status, setStatus] =
      useState<"loading" | "error" | "empty" | "success">("loading");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [wateringError, setWateringError] = useState(false);

  useEffect(() => {
    if (setupId === undefined)
      console.warn("SoilMoistureHistoryChart: setupId not provided, watering overlay disabled");
  }, [setupId]);

  const fetchData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");
    setWateringError(false);
    const { from, to } = getRangeTimestamps(range);
    try {
      const readings = await sensorService.getHistoricalReadings(sensorId, { from, to });
      console.log(readings);
      if (readings.length <= 1) {
        setStatus("empty");
        return;
      }
      const moisturePoints: ChartPoint[] = readings.map((r: SensorHistoricalReading) => ({
        time: new Date(r.timestamp).getTime(),
        moisture:Math.round(r.value/10.23),
        timestamp: r.timestamp,
      }));
      if (setupId !== undefined) {
        try {
          const events = await wateringService.getHistoricalWateringEvents(setupId, from, to);
          console.log(events)
          for (const event of events) {
            const eventTime = Date.parse(event.createdAt);
            let nearest = moisturePoints[0];
            let minDiff = Infinity;
            for (const pt of moisturePoints) {
              const diff = Math.abs(pt.time - eventTime);
              if (diff < minDiff) { minDiff = diff; nearest = pt; }
            }
            nearest._wateringEvent = event;
          }
        } catch (err) {
          console.error("watering events fetch failed", err);
          setWateringError(true);
        }
      }
      setChartData(moisturePoints);
      setStatus("success");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setErrorMessage(axiosErr?.response?.data?.error?.message ?? "Failed to load moisture data.");
      setStatus("error");
    }
  }, [sensorId, setupId, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
      <article className="mf-card p-5 sm:p-6 flex flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mf-eyebrow">Soil moisture</p>
            <h3 className="mf-h2 text-2xl mt-1 text-mf-ink">
              {plantName ? (
                  <>
                    History of <em className="not-italic text-mf-forest" style={{ fontStyle: "italic" }}>{plantName}</em>
                  </>
              ) : (
                  "History"
              )}
            </h3>
          </div>

          {/* Range segmented control */}
          <div role="group" aria-label="Time range" className="mf-tabs">
            {RANGES.map((r) => (
                <button
                    key={r.value}
                    onClick={() => setRange(r.value)}
                    aria-pressed={range === r.value}
                    className="mf-tab px-3"
                    aria-selected={range === r.value}
                >
                  {r.label}
                </button>
            ))}
          </div>
        </header>

        {/* ── States ─────────────────────────────────────────── */}
        {status === "loading" && (
            <div
                aria-busy="true"
                aria-label="Loading soil moisture data"
                className="h-[300px] bg-mf-cream/50 rounded-mf-md animate-pulse"
            />
        )}

        {status === "error" && (
            <div
                role="alert"
                className="flex items-center justify-between gap-4 p-4 rounded-mf-md
                     bg-[#F4DBD2]/40 border border-[#E9C3B5]"
            >
              <p className="text-sm text-mf-ink-2">{errorMessage}</p>
              <button onClick={fetchData} className="mf-btn mf-btn-secondary mf-btn-sm">
                Retry
              </button>
            </div>
        )}

        {status === "empty" && (
            <div className="rounded-mf-md border border-dashed border-mf-line-2
                        bg-mf-cream/40 p-8 text-center">
              <p className="text-sm text-mf-ink-3 max-w-sm mx-auto">
                No moisture history yet. Readings will appear here once your sensor
                has been active for a while.
              </p>
            </div>
        )}

        {status === "success" && (
            <>
              {/* Legend */}
              <div role="list" aria-label="Chart legend" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-mf-ink-2">
                <LegendItem color={COLOR.moisture} shape="line" label="Soil moisture" />
                {setupId !== undefined && (
                    <>
                      <LegendItem
                          color={COLOR.manual}
                          shape="circle"
                          label="Manual watering"
                          testId="legend-manual"
                      />
                      <LegendItem
                          color={COLOR.auto}
                          shape="square"
                          label="Automatic watering"
                          testId="legend-automatic"
                      />
                    </>
                )}
                {wateringError && (
                    <span aria-live="polite" className="text-mf-ink-4 font-mono">
                · watering data unavailable
              </span>
                )}
              </div>

              {/* Chart */}
              <div className="-mx-2">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke={COLOR.grid} vertical={false} />
                    <XAxis
                        dataKey="time"
                        type="number"
                        scale="time"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={formatXTick(range)}
                        stroke={COLOR.axis}
                        tick={{ fill: COLOR.axis, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                        tickLine={false}
                        axisLine={{ stroke: COLOR.grid }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke={COLOR.axis}
                        tick={{ fill: COLOR.axis, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                        width={42}
                    />
                    <Tooltip content={<MoistureTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="moisture"
                        stroke={COLOR.moisture}
                        strokeWidth={1.8}
                        connectNulls
                        dot={(props: any) => {
                          const { cx, cy, payload, key } = props;
                          if (!payload._wateringEvent)
                            return <circle key={key} cx={cx} cy={cy} r={0} fill="none" />;
                          const mode = payload._wateringEvent.mode as WateringEvent["mode"];
                          const color = WATERING_COLOR[mode];
                          if (mode === "automatic") {
                            return (
                                <rect key={key} x={cx - 5} y={cy - 5} width={10} height={10}
                                      rx={2} fill={color} stroke={COLOR.card} strokeWidth={1.5} />
                            );
                          }
                          return (
                              <circle key={key} cx={cx} cy={cy} r={5}
                                      fill={color} stroke={COLOR.card} strokeWidth={1.5} />
                          );
                        }}
                        activeDot={{ r: 5, fill: COLOR.moisture, stroke: COLOR.card, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
        )}
      </article>
  );
}

/* ── Subcomponents ─────────────────────────────────────────── */
function LegendItem({
                      color, shape, label, testId,
                    }: { color: string; shape: "line" | "circle" | "square"; label: string; testId?: string }) {
  return (
      <span role="listitem" className="inline-flex items-center gap-1.5">
      <span
          aria-hidden="true"
          data-testid={testId}
          data-shape={shape}
          className="inline-block"
          style={{
            background: color,
            width: shape === "line" ? 22 : 10,
            height: shape === "line" ? 2.5 : 10,
            borderRadius: shape === "circle" ? "50%" : shape === "square" ? 2 : 2,
          }}
      />
      <span className="text-mf-ink-2">{label}</span>
    </span>
  );
}

function MoistureTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as ChartPoint;
  const event = point._wateringEvent;
  return (
      <div className="mf-card shadow-mf-2 px-3 py-2.5 text-xs">
        <p className="font-mono text-mf-ink-3">
          {new Date(point.timestamp).toLocaleString([], {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
        <p className="mt-1 font-serif text-lg text-mf-ink tracking-tight">
          {point.moisture}<span className="text-sm text-mf-ink-3">%</span>
        </p>
        {event && (
            <p className="mt-1.5 pt-1.5 border-t border-mf-line text-[11px] font-medium"
               style={{ color: WATERING_COLOR[event.mode] }}>
              {MODE_LABELS[event.mode]} watering · {event.waterUsedMl}
            </p>
        )}
      </div>
  );
}
