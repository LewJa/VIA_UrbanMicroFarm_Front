import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WateringEvent } from "~/model/growingSetup/types";
import SoilMoistureHistoryChart from "../SoilMoistureHistoryChart";
import { sensorService } from "~/services/sensorService";
import { wateringService } from "~/services/wateringService";

// Captured during each render so tooltip-content tests can invoke it directly
let capturedTooltipContent: ((props: any) => React.ReactNode) | null = null;

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown[];
  }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: ({ content }: { content: (props: any) => React.ReactNode }) => {
    capturedTooltipContent = content;
    return null;
  },
  ReferenceArea: () => null,
}));

vi.mock("~/services/sensorService", () => ({
  sensorService: {
    getHistoricalReadings: vi.fn(),
  },
}));

vi.mock("~/services/wateringService", () => ({
  wateringService: {
    getHistoricalWateringEvents: vi.fn(),
  },
}));

const mockGetHistoricalReadings = vi.mocked(sensorService.getHistoricalReadings);
const mockGetHistoricalWateringEvents = vi.mocked(wateringService.getHistoricalWateringEvents);

const twoReadings = [
  { value: 512, timestamp: "2024-01-01T12:00:00Z" },
  { value: 256, timestamp: "2024-01-01T13:00:00Z" },
];

describe("SoilMoistureHistoryChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    mockGetHistoricalReadings.mockImplementation(() => new Promise(() => {}));
    render(<SoilMoistureHistoryChart sensorId={1} />);
    expect(screen.getByLabelText("Loading soil moisture data")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("renders chart when API returns data", async () => {
    mockGetHistoricalReadings.mockResolvedValue(twoReadings);
    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() =>
      expect(screen.getByTestId("line-chart")).toBeInTheDocument(),
    );
  });

  it("renders empty state when API returns []", async () => {
    mockGetHistoricalReadings.mockResolvedValue([]);
    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() =>
      expect(screen.getByText(/No moisture history yet/)).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });

  it("renders empty state when API returns a single point", async () => {
    mockGetHistoricalReadings.mockResolvedValue([
      { value: 512, timestamp: "2024-01-01T12:00:00Z" },
    ]);
    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() =>
      expect(screen.getByText(/No moisture history yet/)).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });

  it("renders error message when API fails with a structured error", async () => {
    mockGetHistoricalReadings.mockRejectedValue({
      response: { data: { error: { message: "Sensor offline" } } },
    });
    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument(),
    );
    expect(screen.getByText("Sensor offline")).toBeInTheDocument();
  });

  it("renders fallback error message when API fails without structured error", async () => {
    mockGetHistoricalReadings.mockRejectedValue(new Error("Network Error"));
    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument(),
    );
    expect(
      screen.getByText("Failed to load moisture data."),
    ).toBeInTheDocument();
  });

  it("retry button triggers a refetch", async () => {
    mockGetHistoricalReadings
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValue(twoReadings);

    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() =>
      expect(screen.getByTestId("line-chart")).toBeInTheDocument(),
    );
    expect(mockGetHistoricalReadings).toHaveBeenCalledTimes(2);
  });

  it("range selector change triggers fetch with updated time window", async () => {
    mockGetHistoricalReadings.mockResolvedValue(twoReadings);
    render(<SoilMoistureHistoryChart sensorId={7} />);

    await waitFor(() =>
      expect(mockGetHistoricalReadings).toHaveBeenCalledTimes(1),
    );

    fireEvent.click(screen.getByRole("button", { name: "24h" }));

    await waitFor(() =>
      expect(mockGetHistoricalReadings).toHaveBeenCalledTimes(2),
    );

    const [, firstArgs] = mockGetHistoricalReadings.mock.calls[0];
    const [, secondArgs] = mockGetHistoricalReadings.mock.calls[1];

    const diff1 = Date.parse(firstArgs.to) - Date.parse(firstArgs.from);
    const diff2 = Date.parse(secondArgs.to) - Date.parse(secondArgs.from);
    // 7d window is longer than 24h window
    expect(diff1).toBeGreaterThan(diff2);
    // 24h window is ~86400000ms
    expect(diff2).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(diff2).toBeLessThan(25 * 60 * 60 * 1000);
  });

  it("passes sensorId to the service", async () => {
    mockGetHistoricalReadings.mockResolvedValue(twoReadings);
    render(<SoilMoistureHistoryChart sensorId={42} />);
    await waitFor(() =>
      expect(mockGetHistoricalReadings).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ from: expect.any(String), to: expect.any(String) }),
      ),
    );
  });

  describe("ADC to percentage conversion", () => {
    it("converts 0 → 0%, 512 → 50%, 1023 → 100%", async () => {
      mockGetHistoricalReadings.mockResolvedValue([
        { value: 0, timestamp: "2024-01-01T10:00:00Z" },
        { value: 512, timestamp: "2024-01-01T11:00:00Z" },
        { value: 1023, timestamp: "2024-01-01T12:00:00Z" },
      ]);
      render(<SoilMoistureHistoryChart sensorId={1} />);
      await waitFor(() => {
        const chart = screen.getByTestId("line-chart");
        const data = JSON.parse(chart.getAttribute("data-chart-data")!);
        expect(data[0].moisture).toBe(0);
        expect(data[1].moisture).toBe(50);
        expect(data[2].moisture).toBe(100);
      });
    });
  });

  it("shows plantName in the heading when provided", async () => {
    mockGetHistoricalReadings.mockImplementation(() => new Promise(() => {}));
    render(<SoilMoistureHistoryChart sensorId={1} plantName="Basil" />);
    expect(screen.getByText("Basil — Soil Moisture")).toBeInTheDocument();
  });

  it("shows default heading when plantName is omitted", async () => {
    mockGetHistoricalReadings.mockImplementation(() => new Promise(() => {}));
    render(<SoilMoistureHistoryChart sensorId={1} />);
    expect(screen.getByText("Soil Moisture")).toBeInTheDocument();
  });
});

describe("SoilMoistureHistoryChart — watering overlay", () => {
  const twoReadings = [
    { value: 512, timestamp: "2024-01-15T08:00:00.000Z" },
    { value: 500, timestamp: "2024-01-15T10:00:00.000Z" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    capturedTooltipContent = null;
    mockGetHistoricalReadings.mockResolvedValue(twoReadings);
    mockGetHistoricalWateringEvents.mockResolvedValue([]);
  });

  // C-1
  it("does not fetch watering events when setupId is absent", async () => {
    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));
    expect(mockGetHistoricalWateringEvents).not.toHaveBeenCalled();
  });

  // C-2
  it("logs console.warn once on mount when setupId is absent", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("setupId not provided"));
    warnSpy.mockRestore();
  });

  // C-3
  it("tags manual and automatic events on distinct data points with different eventIds", async () => {
    const readings = [
      { value: 512, timestamp: "2024-01-15T06:00:00.000Z" },
      { value: 500, timestamp: "2024-01-15T12:00:00.000Z" },
      { value: 480, timestamp: "2024-01-15T18:00:00.000Z" },
    ];
    const manualEvent: WateringEvent = {
      eventId: 1,
      startTime: "2024-01-15T05:45:00.000Z",
      endTime:   "2024-01-15T06:15:00.000Z",
      waterUsedLiters: 0.8,
      mode: "manual",
    };
    const automaticEvent: WateringEvent = {
      eventId: 2,
      startTime: "2024-01-15T17:45:00.000Z",
      endTime:   "2024-01-15T18:15:00.000Z",
      waterUsedLiters: 0.5,
      mode: "automatic",
    };
    mockGetHistoricalReadings.mockResolvedValue(readings);
    mockGetHistoricalWateringEvents.mockResolvedValue([manualEvent, automaticEvent]);

    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));

    const chartData = JSON.parse(
      screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
    );
    const manualPt = chartData.find((p: any) => p._wateringEvent?.mode === "manual");
    const autoPt   = chartData.find((p: any) => p._wateringEvent?.mode === "automatic");

    expect(manualPt).toBeDefined();
    expect(autoPt).toBeDefined();
    expect(manualPt.timestamp).not.toBe(autoPt.timestamp);
    expect(manualPt._wateringEvent.eventId).not.toBe(autoPt._wateringEvent.eventId);
  });

  // C-4
  it("tooltip shows moisture, 'Manual Watering' label, and water amount for a manual event", async () => {
    const manualEvent: WateringEvent = {
      eventId: 10,
      startTime: "2024-01-15T08:00:00.000Z",
      endTime:   "2024-01-15T08:30:00.000Z",
      waterUsedLiters: 0.8,
      mode: "manual",
    };
    mockGetHistoricalWateringEvents.mockResolvedValue([manualEvent]);

    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));

    const chartData = JSON.parse(
      screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
    );
    const taggedPt = chartData.find((p: any) => p._wateringEvent);
    expect(taggedPt).toBeDefined();

    const { container } = render(
      capturedTooltipContent!({ active: true, payload: [{ payload: taggedPt }] }) as React.ReactElement,
    );
    expect(container).toHaveTextContent(/Moisture:/);
    expect(container).toHaveTextContent(/Manual Watering/);
    expect(container).toHaveTextContent(/0\.8\s*L/);
  });

  // C-5
  it("tooltip shows 'Automatic Watering' label for an automatic event", async () => {
    const autoEvent: WateringEvent = {
      eventId: 11,
      startTime: "2024-01-15T08:00:00.000Z",
      endTime:   "2024-01-15T08:30:00.000Z",
      waterUsedLiters: 0.5,
      mode: "automatic",
    };
    mockGetHistoricalWateringEvents.mockResolvedValue([autoEvent]);

    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));

    const chartData = JSON.parse(
      screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
    );
    const taggedPt = chartData.find((p: any) => p._wateringEvent);
    const { container } = render(
      capturedTooltipContent!({ active: true, payload: [{ payload: taggedPt }] }) as React.ReactElement,
    );
    expect(container).toHaveTextContent(/Automatic Watering/);
  });

  // C-6
  it("tooltip shows only timestamp and moisture when no watering event is attached", async () => {
    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));

    const chartData = JSON.parse(
      screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
    );
    const plainPt = chartData.find((p: any) => !p._wateringEvent);
    expect(plainPt).toBeDefined();

    const { container } = render(
      capturedTooltipContent!({ active: true, payload: [{ payload: plainPt }] }) as React.ReactElement,
    );
    expect(container).toHaveTextContent(/Moisture:/);
    expect(container).not.toHaveTextContent(/Watering/);
  });

  // C-7
  it("chart data length and timestamps match input readings exactly — no synthetic points added", async () => {
    const readings = [
      { value: 600, timestamp: "2024-01-15T08:00:00.000Z" },
      { value: 550, timestamp: "2024-01-15T10:00:00.000Z" },
    ];
    const event: WateringEvent = {
      eventId: 5,
      startTime: "2024-01-15T08:30:00.000Z",
      endTime:   "2024-01-15T09:00:00.000Z",
      waterUsedLiters: 0.5,
      mode: "automatic",
    };
    mockGetHistoricalReadings.mockResolvedValue(readings);
    mockGetHistoricalWateringEvents.mockResolvedValue([event]);

    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));

    const chartData = JSON.parse(
      screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
    );
    expect(chartData).toHaveLength(readings.length);
    const inputTimes = readings.map((r) => new Date(r.timestamp).getTime());
    expect(chartData.map((p: any) => p.time)).toEqual(inputTimes);
  });

  // C-8
  it("renders chart without the unavailable note when watering events are empty", async () => {
    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));
    expect(screen.queryByText("Watering data unavailable")).not.toBeInTheDocument();
  });

  // C-9
  it("shows 'Watering data unavailable' note when watering fetch fails", async () => {
    mockGetHistoricalWateringEvents.mockRejectedValue(new Error("Network error"));
    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));
    expect(screen.getByText("Watering data unavailable")).toBeInTheDocument();
  });

  // C-10
  it("legend shows both manual (circle) and automatic (square) swatches with distinct shapes", async () => {
    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));

    const manualSwatch = screen.getByTestId("legend-manual");
    const autoSwatch   = screen.getByTestId("legend-automatic");
    expect(manualSwatch).toHaveAttribute("data-shape", "circle");
    expect(autoSwatch).toHaveAttribute("data-shape", "square");
    expect(manualSwatch.getAttribute("data-shape")).not.toBe(autoSwatch.getAttribute("data-shape"));
  });
});
