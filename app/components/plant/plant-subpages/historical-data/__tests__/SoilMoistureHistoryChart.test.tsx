import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SoilMoistureHistoryChart from "../SoilMoistureHistoryChart";
import { sensorService } from "~/services/sensorService";

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
  Tooltip: () => null,
}));

vi.mock("~/services/sensorService", () => ({
  sensorService: {
    getHistoricalReadings: vi.fn(),
  },
}));

const mockGetHistoricalReadings = vi.mocked(sensorService.getHistoricalReadings);

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
