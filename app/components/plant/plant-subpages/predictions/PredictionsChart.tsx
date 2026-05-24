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
  ComposedChart, Area,
} from "recharts";
import { predictionService } from "~/services/predictionService";
import type { Prediction } from "~/model/prediction/types";

const COLOR = {
  line:    "#5A7B8C", // mf-water — predictions are about water
  fill:    "rgba(90,123,140,.10)",
  avg:     "#8A6F4A", // mf-clay — reference line stands out warmly
  grid:    "#E6DFCE", // mf-line
  axis:    "#A8A492", // mf-ink-4
  card:    "#FFFFFF",
};


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

  const min = chartData.length ? Math.min(...chartData.map((p) => p.value)) : 0;
  const max = chartData.length ? Math.max(...chartData.map((p) => p.value)) : 0;

  return (
    <div className="mf-card p-5 sm:p-6 flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mf-eyebrow">Water predictions</p>
          <h3 className="mf-h2 text-2xl mt-1 text-mf-ink">
            {plantName ? (
                <>
                  Forecast for{" "}
                  <em className="not-italic text-mf-forest" style={{ fontStyle: "italic" }}>
                    {plantName}
                  </em>
                </>
            ) : (
                "Water amount predictions"
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
                  className="mf-tab px-3 "
                  aria-selected={range === r.value}
              >
                {r.label}
              </button>
          ))}
        </div>
      </header>


      {status === "success" && (
          <div className="grid grid-cols-3 gap-px bg-mf-line rounded-mf-md overflow-hidden">
            <Stat label="Average" value={average.toFixed(2)} unit="L" emphasized />
            <Stat label="Min" value={min.toFixed(2)} unit="L" />
            <Stat label="Max" value={max.toFixed(2)} unit="L" />
          </div>
      )}


      {status === "loading" && (
          <div
              aria-busy="true"
              aria-label="Loading prediction data"
              className="h-75 bg-mf-cream/50 rounded-mf-md animate-pulse"
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
              No predictions available for this period. Predictions are generated
              daily once your plant has enough sensor history.
            </p>
          </div>
      )}

      {status === "success" && (
          <>
            {/* Legend */}
            <div role="list" aria-label="Chart legend" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-mf-ink-2">
            <span role="listitem" className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block"
                    style={{ width: 22, height: 2.5, borderRadius: 2, background: COLOR.line }} />
              <span>Predicted water (L)</span>
            </span>
              <span role="listitem" className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block"
                    style={{
                      width: 22, height: 0,
                      borderTop: `2px dashed ${COLOR.avg}`,
                    }} />
              <span>Avg {average} L</span>
            </span>
            </div>

            <div className="-mx-2">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="predFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLOR.line} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={COLOR.line} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke={COLOR.grid} vertical={false} />
                  <XAxis
                      dataKey="time"
                      type="number"
                      scale="time"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(ts) => formatXTick(range, ts)}
                      stroke={COLOR.axis}
                      tick={{ fill: COLOR.axis, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                      tickLine={false}
                      axisLine={{ stroke: COLOR.grid }}
                  />
                  <YAxis
                      domain={([dataMin, dataMax]) => [
                        Math.max(0, Math.floor((dataMin - 0.2) * 10) / 10),
                        Math.ceil((dataMax + 0.2) * 10) / 10,
                      ]}
                      tickFormatter={(v) => `${v}L`}
                      stroke={COLOR.axis}
                      tick={{ fill: COLOR.axis, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                      tickLine={false}
                      axisLine={false}
                      width={42}
                  />
                  <ReferenceLine
                      y={average}
                      stroke={COLOR.avg}
                      strokeDasharray="4 4"
                      strokeOpacity={0.85}
                  />
                  <Tooltip content={<PredictionTooltip />} />
                  <Area
                      type="monotone"
                      dataKey="value"
                      stroke="none"
                      fill="url(#predFill)"
                  />
                  <Line
                      type="monotone"
                      dataKey="value"
                      stroke={COLOR.line}
                      strokeWidth={1.8}
                      dot={{ r: 2.5, fill: COLOR.line, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: COLOR.card, fill: COLOR.line }}
                      connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
      )}
    </div>
  );
}

function Stat({
                label, value, unit, emphasized,
              }: { label: string; value: string; unit: string; emphasized?: boolean }) {
  return (
      <div className={`px-4 py-3 ${emphasized ? "bg-mf-card" : "bg-mf-card"}`}>
        <p className="text-[10px] uppercase tracking-[.10em] font-medium text-mf-ink-3">
          {label}
        </p>
        <p className={`mt-1 font-serif tracking-tight ${emphasized ? "text-2xl text-mf-ink" : "text-xl text-mf-ink-2"}`}>
          {value}
          <span className="text-sm text-mf-ink-3 ml-0.5">{unit}</span>
        </p>
      </div>
  );
}

function PredictionTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as ChartPoint;
  return (
      <div className="mf-card shadow-mf-2 px-3 py-2.5 text-xs">
        <p className="font-mono text-mf-ink-3">
          {new Date(point.createdAt).toLocaleDateString([], {
            weekday: "short", year: "numeric", month: "short", day: "numeric",
          })}
        </p>
        <p className="mt-1 font-serif text-lg text-mf-ink tracking-tight">
          {point.value}<span className="text-sm text-mf-ink-3 ml-0.5">L</span>
        </p>
        <p className="text-[10px] uppercase tracking-[.10em] text-mf-water font-medium">
          predicted
        </p>
      </div>
  );
}
