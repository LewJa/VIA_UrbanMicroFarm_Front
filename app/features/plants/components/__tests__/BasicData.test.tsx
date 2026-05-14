import { render, screen, waitFor } from "@testing-library/react";
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

vi.mock("../../../sensors/service/sensorsService", () => ({
  getLatestSensorReading: vi.fn(),
}));

import { useParams, useOutletContext } from "react-router";
import { getLatestSensorReading } from "~/features/sensors/service/sensorsService";

const mockUseParams = vi.mocked(useParams);
const mockUseOutletContext = vi.mocked(useOutletContext);
const mockGetLatestSensorReading = vi.mocked(getLatestSensorReading);

const basePlant = {
  id: 7,
  sensorId: 42,
  name: "Basil",
  description: "Mediterranean herb",
  type: "herb",
  datePlanted: "2024-01-01",
  status: "growing",
};

const sensorReading = {
  sensorId: "3",
  value: 22.5,
  timestamp: "2024-01-15T10:30:00Z",
};

describe("BasicData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ setupId: "1", plantId: "7" });
    mockUseOutletContext.mockReturnValue({
      plant: null,
      plantLoading: false,
      plantError: null,
    });
  });

  it("shows loading state while sensor data is fetching", () => {
    mockGetLatestSensorReading.mockImplementation(() => new Promise(() => {}));
    render(<BasicData />);
    expect(screen.getByText("Loading sensor data...")).toBeInTheDocument();
  });

  it("shows error state when sensor fetch fails", async () => {
    mockGetLatestSensorReading.mockRejectedValue(new Error("Network Error"));
    render(<BasicData />);
    await waitFor(() =>
      expect(
        screen.getByText("Failed to load latest sensor data."),
      ).toBeInTheDocument(),
    );
  });

  it("renders sensor reading data on success", async () => {
    mockGetLatestSensorReading.mockResolvedValue(sensorReading);
    render(<BasicData />);
    await waitFor(() =>
      expect(screen.getByText(/22.5/)).toBeInTheDocument(),
    );
  });

  it("shows plant name in heading when plant is loaded", async () => {
    mockGetLatestSensorReading.mockResolvedValue(sensorReading);
    mockUseOutletContext.mockReturnValue({
      plant: basePlant,
      plantLoading: false,
      plantError: null,
    });
    render(<BasicData />);
    await waitFor(() =>
      expect(screen.getByText("Basil — Latest Readings")).toBeInTheDocument(),
    );
  });

  it("shows fallback heading when plant is not yet loaded", async () => {
    mockGetLatestSensorReading.mockResolvedValue(sensorReading);
    mockUseOutletContext.mockReturnValue({
      plant: null,
      plantLoading: false,
      plantError: null,
    });
    render(<BasicData />);
    await waitFor(() =>
      expect(screen.getByText("Latest Sensor Readings")).toBeInTheDocument(),
    );
  });

  it("uses setupId (not plantId) for the temperature sensor call", async () => {
    mockGetLatestSensorReading.mockResolvedValue(sensorReading);
    render(<BasicData />);
    await waitFor(() =>
      expect(mockGetLatestSensorReading).toHaveBeenCalledWith(1, "TEMPERATURE"),
    );
  });
});
