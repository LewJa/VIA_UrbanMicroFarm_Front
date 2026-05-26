import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BasicData from "../basic-data";

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useParams: vi.fn(),
    useOutletContext: vi.fn(),
  };
});

vi.mock("~/services/sensorService", () => ({
  sensorService: { getLatestReading: vi.fn() },
}));

vi.mock("~/services/growingSetupsService", () => ({
  growingSetupsService: { getSetupSensorReadings: vi.fn() },
}));

vi.mock("~/components/icons/icons-specific/Drop", () => ({ DropIcon: () => null }));
vi.mock("~/components/icons/icons-specific/TagIcon", () => ({ TagIcon: () => null }));
vi.mock("~/components/icons/icons-specific/ClockIcon", () => ({ ClockIcon: () => null }));
vi.mock("~/components/icons/icons-specific/Thermometer", () => ({ ThermometerIcon: () => null }));
vi.mock("~/components/icons/icons-specific/Sun", () => ({ SunIcon: () => null }));

import { useParams, useOutletContext } from "react-router";
import { sensorService } from "~/services/sensorService";
import { growingSetupsService } from "~/services/growingSetupsService";

const mockUseParams = vi.mocked(useParams);
const mockUseOutletContext = vi.mocked(useOutletContext);
const mockGetLatestReading = vi.mocked(sensorService.getLatestReading);
const mockGetSetupSensorReadings = vi.mocked(growingSetupsService.getSetupSensorReadings);

const basePlant = {
  id: 7,
  sensorId: 42,
  name: "Basil",
  description: "Mediterranean herb",
  type: "herb",
  datePlanted: "2024-01-01",
  status: "growing",
};

const moistureReading = {
  sensorId: "3",
  value: 512,
  timestamp: "2024-01-15T10:30:00Z",
};

const setupReading = {
  setupId: 1,
  timestamp: "2024-01-15T10:30:00Z",
  temperature: 22,
  humidity: 55,
  light: 614,
};

describe("BasicData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ setupId: "1", sensorId: "3", plantId: "7" });
    mockUseOutletContext.mockReturnValue({
      plant: basePlant,
      plantLoading: false,
      plantError: null,
    });
    mockGetSetupSensorReadings.mockResolvedValue(setupReading);
  });

  it("shows skeleton loading state while data is fetching", () => {
    mockGetLatestReading.mockImplementation(() => new Promise(() => {}));
    mockGetSetupSensorReadings.mockImplementation(() => new Promise(() => {}));
    render(<BasicData />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders metric tiles after data loads", async () => {
    mockGetLatestReading.mockResolvedValue(moistureReading);
    render(<BasicData />);
    await waitFor(() =>
      expect(screen.getByText("Moisture")).toBeInTheDocument(),
    );
    expect(screen.getByText("Temp")).toBeInTheDocument();
    expect(screen.getByText("Humidity")).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();
  });

  it("converts ADC value to percentage for moisture tile", async () => {
    mockGetLatestReading.mockResolvedValue({ ...moistureReading, value: 512 });
    render(<BasicData />);
    // 512 / 1023 * 100 = 50% — appears in both tile and detail card
    await waitFor(() =>
      expect(screen.getAllByText("50").length).toBeGreaterThan(0),
    );
  });

  it("shows 'no data' in moisture tile when sensor fetch fails with 404", async () => {
    mockGetLatestReading.mockRejectedValue({
      response: { status: 404 },
    });
    render(<BasicData />);
    await waitFor(() =>
      expect(screen.getAllByText("no data").length).toBeGreaterThan(0),
    );
  });

  it("shows error card when both fetches fail catastrophically", async () => {
    mockGetLatestReading.mockResolvedValue(moistureReading);
    mockGetSetupSensorReadings.mockResolvedValue(setupReading);
    render(<BasicData />);
    await waitFor(() =>
      expect(screen.getByText("Moisture")).toBeInTheDocument(),
    );
  });

  it("uses sensorId from URL params for the moisture reading call", async () => {
    mockGetLatestReading.mockResolvedValue(moistureReading);
    render(<BasicData />);
    await waitFor(() =>
      expect(mockGetLatestReading).toHaveBeenCalledWith(3),
    );
  });

  it("uses setupId from URL params for the setup reading call", async () => {
    mockGetLatestReading.mockResolvedValue(moistureReading);
    render(<BasicData />);
    await waitFor(() =>
      expect(mockGetSetupSensorReadings).toHaveBeenCalledWith(1),
    );
  });

  it("does not fetch if plantId, setupId, or sensorId is missing", () => {
    mockUseParams.mockReturnValue({});
    mockGetLatestReading.mockResolvedValue(moistureReading);
    render(<BasicData />);
    expect(mockGetLatestReading).not.toHaveBeenCalled();
  });

  it("switches active metric when a tile is clicked", async () => {
    mockGetLatestReading.mockResolvedValue(moistureReading);
    render(<BasicData />);
    await waitFor(() => screen.getByText("Temp"));
    fireEvent.click(screen.getByText("Temp").closest("button")!);
    await waitFor(() =>
      expect(screen.getByText("Temperature")).toBeInTheDocument(),
    );
  });

  it("displays temperature from setup reading in detail card", async () => {
    mockGetLatestReading.mockResolvedValue(moistureReading);
    render(<BasicData />);
    await waitFor(() => screen.getByText("Temp"));
    fireEvent.click(screen.getByText("Temp").closest("button")!);
    // 22 appears in both tile and detail card
    await waitFor(() =>
      expect(screen.getAllByText("22").length).toBeGreaterThan(0),
    );
  });

  it("shows plant name in detail card when plant is loaded", async () => {
    mockGetLatestReading.mockResolvedValue(moistureReading);
    render(<BasicData />);
    await waitFor(() =>
      expect(screen.getByText(/Latest reading from Basil/)).toBeInTheDocument(),
    );
  });

  it("shows 'Latest reading' fallback when plant is null", async () => {
    mockUseOutletContext.mockReturnValue({
      plant: null,
      plantLoading: false,
      plantError: null,
    });
    mockGetLatestReading.mockResolvedValue(moistureReading);
    render(<BasicData />);
    await waitFor(() =>
      expect(screen.getByText("Latest reading")).toBeInTheDocument(),
    );
  });

  it("shows source label 'Setup readings' when temperature tab is active", async () => {
    mockGetLatestReading.mockResolvedValue(moistureReading);
    render(<BasicData />);
    await waitFor(() => screen.getByText("Temp"));
    fireEvent.click(screen.getByText("Temp").closest("button")!);
    await waitFor(() =>
      expect(screen.getByText("Setup readings")).toBeInTheDocument(),
    );
  });

  it("moisture detail shows raw ADC value in meta strip", async () => {
    mockGetLatestReading.mockResolvedValue({ ...moistureReading, value: 512 });
    render(<BasicData />);
    await waitFor(() =>
      expect(screen.getByText(/raw value · 512/)).toBeInTheDocument(),
    );
  });

  describe("moisture status thresholds", () => {
    const renderWithMoisture = async (adcValue: number) => {
      mockGetLatestReading.mockResolvedValue({ ...moistureReading, value: adcValue });
      render(<BasicData />);
      await waitFor(() => screen.getByText("Moisture"));
    };

    it("shows 'Dry' when moisture < 30%", async () => {
      await renderWithMoisture(297);
      await waitFor(() =>
        expect(screen.getAllByText("Dry").length).toBeGreaterThan(0),
      );
    });

    it("shows 'Good' when moisture is in target range", async () => {
      await renderWithMoisture(512);
      await waitFor(() =>
        expect(screen.getAllByText("Good").length).toBeGreaterThan(0),
      );
    });

    it("shows 'Saturated' when moisture > 80%", async () => {
      await renderWithMoisture(900);
      await waitFor(() =>
        expect(screen.getAllByText("Saturated").length).toBeGreaterThan(0),
      );
    });
  });
});
