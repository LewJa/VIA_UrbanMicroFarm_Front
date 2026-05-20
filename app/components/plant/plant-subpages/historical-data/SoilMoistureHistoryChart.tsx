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

const MODE_LABELS: Record<WateringEvent["mode"], string> = {
  manual: "Manual",
  automatic: "Automatic",
};

const WATERING_COLOR: Record<WateringEvent["mode"], string> = {
  manual: "#f97316",
  automatic: "#3b82f6",
};

type Range = "24h" | "7d" | "30d";

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

const adcToPercent = (value: number): number =>
  Math.round((value / 1023) * 100);

function getRangeTimestamps(range: Range): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  if (range === "24h") from.setHours(from.getHours() - 24);
  else if (range === "7d") from.setDate(from.getDate() - 7);
  else from.setDate(from.getDate() - 30);
  return { from: from.toISOString(), to: to.toISOString() };
}

function formatXTick(range: Range): (ts: number) => string {
  return (ts: number) => {
    const d = new Date(ts);
    if (range === "24h")
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };
}

const RANGES: { label: string; value: Range }[] = [
  { label: "24h", value: "24h" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
];

export default function SoilMoistureHistoryChart({ sensorId, plantName, setupId }: Props) {
  const [range, setRange] = useState<Range>("7d");
  const [status, setStatus] = useState<"loading" | "error" | "empty" | "success">("loading");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [wateringError, setWateringError] = useState(false);

  useEffect(() => {
    if (setupId === undefined) {
      console.warn(
        "SoilMoistureHistoryChart: setupId not provided, watering overlay disabled",
      );
    }
  }, [setupId]);

  const fetchData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");
    setWateringError(false);
    const { from, to } = getRangeTimestamps(range);

    try {
      const readings = await sensorService.getHistoricalReadings(sensorId, { from, to });
      if (readings.length <= 1) {
        setStatus("empty");
        return;
      }

      const moisturePoints: ChartPoint[] = readings.map((r: SensorHistoricalReading) => ({
        time: new Date(r.timestamp).getTime(),
        moisture: adcToPercent(r.value),
        timestamp: r.timestamp,
      }));

      if (setupId !== undefined) {
        try {
          const events = await wateringService.getHistoricalWateringEvents(setupId, from, to);
          for (const event of events) {
            const eventMid = (Date.parse(event.startTime) + Date.parse(event.endTime)) / 2;
            let nearest = moisturePoints[0];
            let minDiff = Infinity;
            for (const pt of moisturePoints) {
              const diff = Math.abs(pt.time - eventMid);
              if (diff < minDiff) { minDiff = diff; nearest = pt; }
            }
            if (nearest) nearest._wateringEvent = event;
          }
        } catch (err) {
          console.error("SoilMoistureHistoryChart: watering events fetch failed", err);
          setWateringError(true);
        }
      }

      setChartData(moisturePoints);
      setStatus("success");
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      setErrorMessage(
        axiosErr?.response?.data?.error?.message ?? "Failed to load moisture data.",
      );
      setStatus("error");
    }
  }, [sensorId, setupId, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const title = plantName ? `${plantName} — Soil Moisture` : "Soil Moisture";

  return (
    <div>
      <h3>{title}</h3>

      <div role="group" aria-label="Time range" className="flex gap-1 p-1 bg-mf-cream rounded-full w-fit my-3">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            aria-pressed={range === r.value}
            className={`h-8 px-3 rounded-full text-[13px] font-medium cursor-pointer border-0 transition-all duration-150 ${
              range === r.value
                ? "bg-mf-card text-mf-ink shadow-mf-1"
                : "bg-transparent text-mf-ink-2 hover:bg-mf-card/60"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {status === "loading" && (
        <div aria-busy="true" aria-label="Loading soil moisture data">
          Loading…
        </div>
      )}

      {status === "error" && (
        <div role="alert">
          <p>{errorMessage}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {status === "empty" && (
        <p>
          No moisture history yet. Readings will appear here once your sensor
          has been active for a while.
        </p>
      )}

      {status === "success" && (
        <>
          <div role="list" aria-label="Chart legend">
            <div role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 12 }}>
              <span
                aria-hidden="true"
                style={{ display: "inline-block", width: 24, height: 3, borderRadius: 2, background: "#4ade80" }}
              />
              Soil Moisture
            </div>
            {setupId !== undefined && (
              <>
                <div role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 12 }}>
                  <span
                    aria-hidden="true"
                    data-testid="legend-manual"
                    data-shape="circle"
                    style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: WATERING_COLOR.manual }}
                  />
                  Manual Watering
                </div>
                <div role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 12 }}>
                  <span
                    aria-hidden="true"
                    data-testid="legend-automatic"
                    data-shape="square"
                    style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: WATERING_COLOR.automatic }}
                  />
                  Automatic Watering
                </div>
              </>
            )}
            {wateringError && (
              <span aria-live="polite" style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: 8 }}>
                Watering data unavailable
              </span>
            )}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatXTick(range)}
              />
              <YAxis
                domain={[0, 100]}
                label={{ value: "Moisture (%)", angle: -90, position: "insideLeft" }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as ChartPoint;
                  const event = point._wateringEvent;
                  return (
                    <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "8px 12px", borderRadius: 6 }}>
                      <p>{new Date(point.timestamp).toLocaleString()}</p>
                      <p>Moisture: {point.moisture}%</p>
                      {event && (
                        <p style={{ marginTop: 4, fontWeight: 600, color: WATERING_COLOR[event.mode] }}>
                          {MODE_LABELS[event.mode]} Watering — {event.waterUsedLiters} L
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              <Line
                type="monotone"
                dataKey="moisture"
                stroke="#4ade80"
                connectNulls
                dot={(props: any) => {
                  const { cx, cy, payload, key } = props;
                  if (!payload._wateringEvent) {
                    return <circle key={key} cx={cx} cy={cy} r={0} fill="none" />;
                  }
                  const mode = payload._wateringEvent.mode as WateringEvent["mode"];
                  const color = WATERING_COLOR[mode];
                  if (mode === "automatic") {
                    return (
                      <rect
                        key={key}
                        x={cx - 5}
                        y={cy - 5}
                        width={10}
                        height={10}
                        rx={2}
                        fill={color}
                        stroke="white"
                        strokeWidth={1.5}
                      />
                    );
                  }
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={color}
                      stroke="white"
                      strokeWidth={1.5}
                    />
                  );
                }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
