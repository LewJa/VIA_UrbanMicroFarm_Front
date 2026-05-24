import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WateringEvent } from "~/model/growingSetup/types";
import SoilMoistureHistoryChart from "../SoilMoistureHistoryChart";
import { sensorService } from "~/services/sensorService";
import { wateringService } from "~/services/wateringService";


vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ReferenceArea: () => null,
}));

vi.mock("~/services/sensorService", () => ({
  sensorService: { getHistoricalReadings: vi.fn() },
}));

vi.mock("~/services/wateringService", () => ({
  wateringService: { getHistoricalWateringEvents: vi.fn() },
}));

const mockGetHistoricalReadings = vi.mocked(sensorService.getHistoricalReadings);
const mockGetHistoricalWateringEvents = vi.mocked(wateringService.getHistoricalWateringEvents);

const twoReadings = [
  { value: 50, timestamp: "2024-01-01T12:00:00Z" },
  { value: 60, timestamp: "2024-01-01T13:00:00Z" },
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

  it("renders chart when API returns multiple readings", async () => {
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
      { value: 50, timestamp: "2024-01-01T12:00:00Z" },
    ]);
    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() =>
      expect(screen.getByText(/No moisture history yet/)).toBeInTheDocument(),
    );
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
    expect(screen.getByText("Failed to load moisture data.")).toBeInTheDocument();
  });

  it("retry button triggers a refetch", async () => {
    mockGetHistoricalReadings
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValue(twoReadings);

    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(screen.getByTestId("line-chart")).toBeInTheDocument(),
    );
    expect(mockGetHistoricalReadings).toHaveBeenCalledTimes(2);
  });

  it("has three range buttons: 7 days, 30 days, 90 days", () => {
    mockGetHistoricalReadings.mockImplementation(() => new Promise(() => {}));
    render(<SoilMoistureHistoryChart sensorId={1} />);
    expect(screen.getByRole("button", { name: "7 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "90 days" })).toBeInTheDocument();
  });

  it("default range is 7 days", () => {
    mockGetHistoricalReadings.mockImplementation(() => new Promise(() => {}));
    render(<SoilMoistureHistoryChart sensorId={1} />);
    expect(screen.getByRole("button", { name: "7 days" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "90 days" })).toHaveAttribute("aria-pressed", "false");
  });

  it("switching to 30 days triggers a new fetch with a longer window", async () => {
    mockGetHistoricalReadings.mockResolvedValue(twoReadings);
    render(<SoilMoistureHistoryChart sensorId={7} />);
    await waitFor(() => expect(mockGetHistoricalReadings).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "30 days" }));
    await waitFor(() => expect(mockGetHistoricalReadings).toHaveBeenCalledTimes(2));

    const [[, firstArgs], [, secondArgs]] = mockGetHistoricalReadings.mock.calls;
    const diff1 = Date.parse(firstArgs.to) - Date.parse(firstArgs.from);
    const diff2 = Date.parse(secondArgs.to) - Date.parse(secondArgs.from);
    // 30d window is longer than 7d window
    expect(diff2).toBeGreaterThan(diff1);
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

  it("passes raw values directly to chart data (no ADC conversion)", async () => {
    mockGetHistoricalReadings.mockResolvedValue([
      { value: 38.0, timestamp: "2024-01-01T10:00:00Z" },
      { value: 76.4, timestamp: "2024-01-01T11:00:00Z" },
    ]);
    render(<SoilMoistureHistoryChart sensorId={1} />);
    await waitFor(() => {
      const data = JSON.parse(
        screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
      );
      expect(data[0].moisture).toBe(38.0);
      expect(data[1].moisture).toBe(76.4);
    });
  });

  it("shows plantName in the heading when provided", () => {
    mockGetHistoricalReadings.mockImplementation(() => new Promise(() => {}));
    render(<SoilMoistureHistoryChart sensorId={1} plantName="Basil" />);
    expect(screen.getByText("Basil")).toBeInTheDocument();
  });

  it("shows default heading when plantName is omitted", () => {
    mockGetHistoricalReadings.mockImplementation(() => new Promise(() => {}));
    render(<SoilMoistureHistoryChart sensorId={1} />);
    expect(screen.getByText("History")).toBeInTheDocument();
  });
});

describe("SoilMoistureHistoryChart — watering overlay", () => {
  const readings = [
    { value: 50, timestamp: "2024-01-15T08:00:00.000Z" },
    { value: 60, timestamp: "2024-01-15T10:00:00.000Z" },
    { value: 70, timestamp: "2024-01-15T18:00:00.000Z" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetHistoricalReadings.mockResolvedValue(readings);
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

  // C-3: uses createdAt (new WateringEvent shape)
  it("tags manual and automatic events on distinct data points", async () => {
    const moreReadings = [
      { value: 50, timestamp: "2024-01-15T06:00:00.000Z" },
      { value: 60, timestamp: "2024-01-15T12:00:00.000Z" },
      { value: 70, timestamp: "2024-01-15T18:00:00.000Z" },
    ];
    const manualEvent: WateringEvent = {
      id: 1,
      waterUsedMl: 284,
      mode: "manual",
      createdAt: "2024-01-15T06:00:00.000Z",
    };
    const automaticEvent: WateringEvent = {
      id: 2,
      waterUsedMl: 310,
      mode: "automatic",
      createdAt: "2024-01-15T18:00:00.000Z",
    };
    mockGetHistoricalReadings.mockResolvedValue(moreReadings);
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
    expect(manualPt._wateringEvent.id).not.toBe(autoPt._wateringEvent.id);
  });

  // C-7
  it("chart data length matches input readings exactly — no synthetic points added", async () => {
    const event: WateringEvent = {
      id: 5,
      waterUsedMl: 295,
      mode: "automatic",
      createdAt: "2024-01-15T09:00:00.000Z",
    };
    mockGetHistoricalWateringEvents.mockResolvedValue([event]);

    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));

    const chartData = JSON.parse(
      screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
    );
    expect(chartData).toHaveLength(readings.length);
  });

  // C-8
  it("does not show watering unavailable note when events load successfully", async () => {
    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));
    expect(screen.queryByText(/watering data unavailable/i)).not.toBeInTheDocument();
  });

  // C-9
  it("shows watering data unavailable note when watering fetch fails", async () => {
    mockGetHistoricalWateringEvents.mockRejectedValue(new Error("Network error"));
    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));
    expect(screen.getByText(/watering data unavailable/i)).toBeInTheDocument();
  });

  // C-10
  it("legend shows both manual (circle) and automatic (square) swatches", async () => {
    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));

    const manualSwatch = screen.getByTestId("legend-manual");
    const autoSwatch   = screen.getByTestId("legend-automatic");
    expect(manualSwatch).toHaveAttribute("data-shape", "circle");
    expect(autoSwatch).toHaveAttribute("data-shape", "square");
    expect(manualSwatch.getAttribute("data-shape")).not.toBe(autoSwatch.getAttribute("data-shape"));
  });

  // C-11: nearest-point matching uses createdAt
  it("attaches event to the nearest reading by createdAt timestamp", async () => {
    const preciseReadings = [
      { value: 50, timestamp: "2024-01-15T08:00:00.000Z" },
      { value: 60, timestamp: "2024-01-15T10:00:00.000Z" },
    ];
    const event: WateringEvent = {
      id: 1,
      waterUsedMl: 284,
      mode: "manual",
      createdAt: "2024-01-15T08:00:00.000Z", // exact match to first reading
    };
    mockGetHistoricalReadings.mockResolvedValue(preciseReadings);
    mockGetHistoricalWateringEvents.mockResolvedValue([event]);

    render(<SoilMoistureHistoryChart sensorId={1} setupId={1} />);
    await waitFor(() => screen.getByTestId("line-chart"));

    const chartData = JSON.parse(
      screen.getByTestId("line-chart").getAttribute("data-chart-data")!,
    );
    // First point should have the event, second should not
    expect(chartData[0]._wateringEvent).toBeDefined();
    expect(chartData[1]._wateringEvent).toBeUndefined();
  });
});
