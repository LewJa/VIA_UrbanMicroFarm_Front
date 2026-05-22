import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PredictionsChart from "../PredictionsChart";
import { predictionService } from "~/services/predictionService";

let capturedTooltipContent: ((props: unknown) => React.ReactNode) | null = null;
let capturedReferenceLineY: number | null = null;

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  LineChart: () => null,
  Line: () => null,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: ({ content }: { content: (props: unknown) => React.ReactNode }) => {
    capturedTooltipContent = content;
    return null;
  },
  ReferenceLine: ({ y }: { y: number }) => {
    capturedReferenceLineY = y;
    return null;
  },
}));

vi.mock("~/services/predictionService", () => ({
  predictionService: { getPredictions: vi.fn() },
}));

const mockGetPredictions = vi.mocked(predictionService.getPredictions);

// Fixed reference point so date arithmetic is deterministic
const NOW = new Date("2024-01-31T12:00:00.000Z").getTime();
const DAY = 24 * 60 * 60 * 1000;

function pred(daysAgo: number, value: number, id: number) {
  return {
    predictionId: id,
    predictedValue: value,
    createdAt: new Date(NOW - daysAgo * DAY).toISOString(),
    plantName: "Tomato",
  };
}

const within7d  = [pred(1, 1.0, 1), pred(2, 1.1, 2), pred(3, 0.9, 3), pred(5, 1.2, 4), pred(6, 1.0, 5)];
const within30d = [pred(10, 0.8, 6), pred(15, 0.9, 7), pred(20, 1.1, 8), pred(25, 1.0, 9), pred(28, 0.7, 10)];
const within60d = [pred(35, 0.6, 11), pred(40, 0.8, 12), pred(50, 0.9, 13), pred(55, 0.7, 14), pred(58, 1.0, 15)];
const allPredictions = [...within7d, ...within30d, ...within60d];

describe("PredictionsChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedTooltipContent = null;
    capturedReferenceLineY = null;
    vi.spyOn(Date, "now").mockReturnValue(NOW);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  it("shows loading indicator before data arrives", () => {
    mockGetPredictions.mockImplementation(() => new Promise(() => {}));
    render(<PredictionsChart plantId={1} />);
    expect(screen.getByLabelText("Loading prediction data")).toHaveAttribute("aria-busy", "true");
  });

  // ── Error ──────────────────────────────────────────────────────────────────

  it("shows structured error message from API response", async () => {
    mockGetPredictions.mockRejectedValue({
      response: { data: { error: { message: "Prediction service unavailable" } } },
    });
    render(<PredictionsChart plantId={1} />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByText("Prediction service unavailable")).toBeInTheDocument();
  });

  it("shows fallback error message when rejection has no structured body", async () => {
    mockGetPredictions.mockRejectedValue(new Error("Network Error"));
    render(<PredictionsChart plantId={1} />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByText("Failed to load prediction data.")).toBeInTheDocument();
  });

  it("retry button triggers a refetch and shows chart on success", async () => {
    mockGetPredictions
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValue(within30d);
    render(<PredictionsChart plantId={1} />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.getByTestId("line-chart")).toBeInTheDocument());
    expect(mockGetPredictions).toHaveBeenCalledTimes(2);
  });

  // ── Empty ──────────────────────────────────────────────────────────────────

  it("shows empty-state message when no predictions fall within the selected range", async () => {
    // within60d are all 35–58 days old; default range is 30d so all are filtered out
    mockGetPredictions.mockResolvedValue(within60d);
    render(<PredictionsChart plantId={1} />);
    await waitFor(() =>
      expect(screen.getByText(/No predictions available for this period/)).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });

  // ── Success ────────────────────────────────────────────────────────────────

  it("renders chart when predictions are within the selected range", async () => {
    mockGetPredictions.mockResolvedValue(within30d);
    render(<PredictionsChart plantId={1} />);
    await waitFor(() => expect(screen.getByTestId("line-chart")).toBeInTheDocument());
  });

  it("passes plantId to the prediction service", async () => {
    mockGetPredictions.mockResolvedValue(within7d);
    render(<PredictionsChart plantId={42} />);
    await waitFor(() => expect(mockGetPredictions).toHaveBeenCalledWith(42));
  });

  // ── Range filter buttons ───────────────────────────────────────────────────

  it("default range is 30d — its button is pressed, 7d button is not", () => {
    mockGetPredictions.mockImplementation(() => new Promise(() => {}));
    render(<PredictionsChart plantId={1} />);
    expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "7 days" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "60 days" })).toHaveAttribute("aria-pressed", "false");
  });

  it("selecting 7d filters chart data to the last 7 days only", async () => {
    mockGetPredictions.mockResolvedValue(allPredictions);
    render(<PredictionsChart plantId={1} />);
    fireEvent.click(screen.getByRole("button", { name: "7 days" }));
    await waitFor(() => {
      const data = JSON.parse(
        screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
      );
      expect(data).toHaveLength(within7d.length);
    });
  });

  it("selecting 60d shows more data points than the default 30d", async () => {
    mockGetPredictions.mockResolvedValue(allPredictions);
    render(<PredictionsChart plantId={1} />);

    await waitFor(() => screen.getByTestId("line-chart"));
    const count30d = JSON.parse(
      screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
    ).length;

    fireEvent.click(screen.getByRole("button", { name: "60 days" }));

    await waitFor(() => {
      const count60d = JSON.parse(
        screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
      ).length;
      expect(count60d).toBeGreaterThan(count30d);
    });
  });

  // ── Data shape ────────────────────────────────────────────────────────────

  it("chart data is sorted by time ascending", async () => {
    // Supply predictions in reverse order
    mockGetPredictions.mockResolvedValue([...within30d].reverse());
    render(<PredictionsChart plantId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));
    const times: number[] = JSON.parse(
      screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
    ).map((p: { time: number }) => p.time);
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  // ── Average ────────────────────────────────────────────────────────────────

  it("displays the computed average in the legend", async () => {
    mockGetPredictions.mockResolvedValue([pred(5, 1.0, 1), pred(10, 2.0, 2)]);
    render(<PredictionsChart plantId={1} />);
    await waitFor(() => expect(screen.getByTestId("line-chart")).toBeInTheDocument());
    // (1.0 + 2.0) / 2 = 1.5
    expect(screen.getByText(/Avg 1\.5 L/)).toBeInTheDocument();
  });

  it("ReferenceLine y matches the computed average", async () => {
    mockGetPredictions.mockResolvedValue([pred(5, 1.0, 1), pred(10, 3.0, 2)]);
    render(<PredictionsChart plantId={1} />);
    await waitFor(() => expect(screen.getByTestId("line-chart")).toBeInTheDocument());
    // (1.0 + 3.0) / 2 = 2.0
    expect(capturedReferenceLineY).toBe(2.0);
  });

  // ── Title ──────────────────────────────────────────────────────────────────

  it("shows plant name in the heading when plantName is provided", () => {
    mockGetPredictions.mockImplementation(() => new Promise(() => {}));
    render(<PredictionsChart plantId={1} plantName="Basil" />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Basil");
  });

  it("shows generic heading when plantName is omitted", () => {
    mockGetPredictions.mockImplementation(() => new Promise(() => {}));
    render(<PredictionsChart plantId={1} />);
    expect(screen.getByText("Water amount predictions")).toBeInTheDocument();
  });

  // ── Tooltip ────────────────────────────────────────────────────────────────

  it("tooltip shows predicted value and date for a chart point", async () => {
    // Single prediction so index 0 is unambiguous after sort
    mockGetPredictions.mockResolvedValue([pred(5, 1.25, 1)]);
    render(<PredictionsChart plantId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));

    const point = JSON.parse(
      screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
    )[0];

    const { container } = render(
      capturedTooltipContent!({ active: true, payload: [{ payload: point }] }) as React.ReactElement,
    );
    expect(container).toHaveTextContent(/1\.25 L predicted/);
  });

  it("tooltip returns null when not active", async () => {
    mockGetPredictions.mockResolvedValue([pred(5, 1.0, 1), pred(6, 1.0, 2)]);
    render(<PredictionsChart plantId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));
    expect(capturedTooltipContent!({ active: false, payload: [] })).toBeNull();
  });
});
