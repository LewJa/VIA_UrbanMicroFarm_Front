import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { predictionService } from "~/services/predictionService";
import type { Prediction } from "~/model/prediction/types";

type Range = "7d" | "30d" | "60d";

interface Props {
  plantId: number;
  plantName?: string;
}

interface ChartPoint {
  time: number;
  value: number;
  createdAt: string;
}

const RANGES: { label: string; value: Range }[] = [
  { label: "7 days",  value: "7d"  },
  { label: "30 days", value: "30d" },
  { label: "60 days", value: "60d" },
];

function getRangeCutoff(range: Range): number {
  const now = Date.now();
  if (range === "7d")  return now - 7  * 24 * 60 * 60 * 1000;
  if (range === "30d") return now - 30 * 24 * 60 * 60 * 1000;
  return now - 60 * 24 * 60 * 60 * 1000;
}

function formatXTick(range: Range, ts: number): string {
  const d = new Date(ts);
  if (range === "7d")
    return d.toLocaleDateString([], { weekday: "short", day: "numeric" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function PredictionsChart({ plantId, plantName }: Props) {
  const [range, setRange]               = useState<Range>("30d");
  const [status, setStatus]             = useState<"loading" | "error" | "empty" | "success">("loading");
  const [chartData, setChartData]       = useState<ChartPoint[]>([]);
  const [average, setAverage]           = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");
    const cutoff = getRangeCutoff(range);

    try {
      const predictions = await predictionService.getPredictions(plantId);

      const filtered: ChartPoint[] = predictions
        .filter((p: Prediction) => new Date(p.createdAt).getTime() >= cutoff)
        .map((p: Prediction) => ({
          time: new Date(p.createdAt).getTime(),
          value: p.predictedValue,
          createdAt: p.createdAt,
        }))
        .sort((a, b) => a.time - b.time);

      if (filtered.length === 0) {
        setStatus("empty");
        return;
      }

      const avg = filtered.reduce((sum, p) => sum + p.value, 0) / filtered.length;
      setAverage(Math.round(avg * 100) / 100);
      setChartData(filtered);
      setStatus("success");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setErrorMessage(
        axiosErr?.response?.data?.error?.message ?? "Failed to load prediction data.",
      );
      setStatus("error");
    }
  }, [plantId, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const title = plantName ? `${plantName} — Water Predictions` : "Water Amount Predictions";

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
        <div aria-busy="true" aria-label="Loading prediction data">
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
          No predictions available for this period. Predictions are generated
          daily once your plant has enough sensor history.
        </p>
      )}

      {status === "success" && (
        <>
          <div role="list" aria-label="Chart legend">
            <div role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 16 }}>
              <span
                aria-hidden="true"
                style={{ display: "inline-block", width: 24, height: 3, borderRadius: 2, background: "#3b82f6" }}
              />
              Predicted Water (L)
            </div>
            <div role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span
                aria-hidden="true"
                style={{ display: "inline-block", width: 24, height: 2, borderRadius: 1, background: "#f97316", opacity: 0.7, borderTop: "2px dashed #f97316" }}
              />
              {`avg ${average} L`}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(ts) => formatXTick(range, ts)}
              />
              <YAxis
                domain={([dataMin, dataMax]) => [
                  Math.max(0, Math.floor((dataMin - 0.2) * 10) / 10),
                  Math.ceil((dataMax + 0.2) * 10) / 10,
                ]}
                tickFormatter={(v) => `${v} L`}
                label={{ value: "Water (L)", angle: -90, position: "insideLeft" }}
              />

              <ReferenceLine
                y={average}
                stroke="#f97316"
                strokeDasharray="4 4"
                strokeOpacity={0.7}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as ChartPoint;
                  return (
                    <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "8px 12px", borderRadius: 6 }}>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                        {new Date(point.createdAt).toLocaleDateString([], {
                          weekday: "short", year: "numeric", month: "short", day: "numeric",
                        })}
                      </p>
                      <p style={{ margin: "4px 0 0", fontWeight: 600, color: "#3b82f6" }}>
                        {point.value} L predicted
                      </p>
                    </div>
                  );
                }}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
