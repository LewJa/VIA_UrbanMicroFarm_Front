import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HistoricalData from "../historical-data";

// Stub SoilMoistureHistoryChart so we can inspect the props it receives
vi.mock("../SoilMoistureHistoryChart", () => ({
  default: ({
    sensorId,
    plantName,
    setupId,
  }: {
    sensorId: number;
    plantName?: string;
    setupId?: number;
  }) => (
    <div
      data-testid="chart"
      data-sensor-id={String(sensorId)}
      data-plant-name={plantName ?? ""}
      data-setup-id={setupId !== undefined ? String(setupId) : ""}
    />
  ),
}));

// Mock useOutletContext and useParams so we control what the parent provides
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return { ...actual, useOutletContext: vi.fn(), useParams: vi.fn() };
});

import { useOutletContext, useParams } from "react-router";
const mockUseOutletContext = vi.mocked(useOutletContext);
const mockUseParams = vi.mocked(useParams);

const basePlant = {
  id: 7,
  sensorId: 42,
  name: "Basil",
  description: "Mediterranean herb",
  type: "herb",
  datePlanted: "2024-01-01",
  status: "growing",
};

describe("HistoricalData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({});
  });

  it("shows loading skeleton while plant is loading", () => {
    mockUseOutletContext.mockReturnValue({
      plant: null,
      plantLoading: true,
      plantError: null,
    });
    render(<HistoricalData />);
    expect(screen.getByLabelText("Loading plant data")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.queryByTestId("chart")).not.toBeInTheDocument();
  });

  it("shows error message when plant fetch fails", () => {
    mockUseOutletContext.mockReturnValue({
      plant: null,
      plantLoading: false,
      plantError: "Plant not found",
    });
    render(<HistoricalData />);
    expect(screen.getByRole("alert")).toHaveTextContent("Plant not found");
    expect(screen.queryByTestId("chart")).not.toBeInTheDocument();
  });

  it("renders chart with plant.sensorId — not plant.id", () => {
    mockUseOutletContext.mockReturnValue({
      plant: basePlant,
      plantLoading: false,
      plantError: null,
    });
    render(<HistoricalData />);
    const chart = screen.getByTestId("chart");
    // sensorId=42, NOT plant.id=7 — a regression to parseInt(plantId) would fail this
    expect(chart).toHaveAttribute("data-sensor-id", "42");
  });

  it("does NOT pass plant.id as sensorId", () => {
    mockUseOutletContext.mockReturnValue({
      plant: basePlant,
      plantLoading: false,
      plantError: null,
    });
    render(<HistoricalData />);
    expect(screen.getByTestId("chart")).not.toHaveAttribute(
      "data-sensor-id",
      "7",
    );
  });

  it("passes plant.name as plantName to the chart", () => {
    mockUseOutletContext.mockReturnValue({
      plant: basePlant,
      plantLoading: false,
      plantError: null,
    });
    render(<HistoricalData />);
    expect(screen.getByTestId("chart")).toHaveAttribute(
      "data-plant-name",
      "Basil",
    );
  });

  it("renders nothing when plant is null and not loading", () => {
    mockUseOutletContext.mockReturnValue({
      plant: null,
      plantLoading: false,
      plantError: null,
    });
    const { container } = render(<HistoricalData />);
    expect(container).toBeEmptyDOMElement();
  });

  // C-12
  it("passes setupId from URL params to the chart as a number", () => {
    mockUseParams.mockReturnValue({ setupId: "5", sensorId: "101", plantId: "1" });
    mockUseOutletContext.mockReturnValue({ plant: basePlant, plantLoading: false, plantError: null });
    render(<HistoricalData />);
    expect(screen.getByTestId("chart")).toHaveAttribute("data-setup-id", "5");
  });

  // C-12b
  it("passes undefined setupId to chart when setupId param is absent from URL", () => {
    mockUseParams.mockReturnValue({ sensorId: "101", plantId: "1" });
    mockUseOutletContext.mockReturnValue({ plant: basePlant, plantLoading: false, plantError: null });
    render(<HistoricalData />);
    expect(screen.getByTestId("chart")).toHaveAttribute("data-setup-id", "");
  });
});
