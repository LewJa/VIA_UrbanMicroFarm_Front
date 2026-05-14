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
import { sensorService } from "~/features/sensors/service/sensorService";
import type { SensorHistoricalReading } from "~/features/sensors/types";

type Range = "24h" | "7d" | "30d";

interface Props {
  sensorId: number;
  plantName?: string;
}

interface ChartPoint {
  time: number;
  moisture: number;
  timestamp: string;
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

export default function SoilMoistureHistoryChart({ sensorId, plantName }: Props) {
  const [range, setRange] = useState<Range>("7d");
  const [status, setStatus] = useState<"loading" | "error" | "empty" | "success">(
    "loading",
  );
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");
    const { from, to } = getRangeTimestamps(range);
    try {
      const readings = await sensorService.getHistoricalReadings(sensorId, { from, to });
      if (readings.length <= 1) {
        setStatus("empty");
        return;
      }
      setChartData(
        readings.map((r: SensorHistoricalReading) => ({
          time: new Date(r.timestamp).getTime(),
          moisture: adcToPercent(r.value),
          timestamp: r.timestamp,
        })),
      );
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
  }, [sensorId, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const title = plantName ? `${plantName} — Soil Moisture` : "Soil Moisture";

  return (
    <div>
      <h3>{title}</h3>

      <div role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            aria-pressed={range === r.value}
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
                const { timestamp, moisture } = payload[0].payload as ChartPoint;
                return (
                  <div>
                    <p>{new Date(timestamp).toLocaleString()}</p>
                    <p>Moisture: {moisture}%</p>
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="moisture" stroke="#4ade80" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
