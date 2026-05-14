/* @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../basic-data.css", () => ({}));

vi.mock("react-router", () => ({
  useParams: () => ({
    setupId: "1",
    plantId: "1",
  }),
}));

vi.mock("../../../sensors/service/sensorsService", () => ({
  getLatestSensorReading: vi.fn(),
}));

import { getLatestSensorReading } from "../../../sensors/service/sensorsService";
import BasicData from "../basic-data";

describe("BasicData Component", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading state initially", () => {

    vi.mocked(getLatestSensorReading).mockImplementation(
      () => new Promise(() => {})
    );

    render(<BasicData />);

    expect(
      screen.getByText("Loading sensor data...")
    ).toBeInTheDocument();
  });

  it("displays sensor reading correctly", async () => {

    vi.mocked(getLatestSensorReading).mockResolvedValue({
      sensorId: "7",
      value: 512,
      timestamp: "2024-01-15T10:30:00Z",
    });

    render(<BasicData />);

    await waitFor(() => {
      expect(
        screen.getByText(/512/)
      ).toBeInTheDocument();
    });
  });

  it("displays no data state", async () => {

    vi.mocked(getLatestSensorReading).mockResolvedValue(null as any);

    render(<BasicData />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "No sensor data available for this plant."
        )
      ).toBeInTheDocument();
    });
  });

  it("displays error state", async () => {

    vi.mocked(getLatestSensorReading).mockRejectedValue(
      new Error("API Error")
    );

    render(<BasicData />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to load latest sensor data."
        )
      ).toBeInTheDocument();
    });
  });

});