/* @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../basic-data.css", () => ({}));

vi.mock("react-router", () => ({
  useParams: () => ({
    plantId: "1",
  }),
}));

import * as sensorService from "../../../../services/sensorService";

vi.spyOn(sensorService.sensorService, "getLatestReading");

import BasicData from "../basic-data";

describe("BasicData Component", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading state initially", () => {

    (sensorService.sensorService.getLatestReading as any)
      .mockImplementation(() => new Promise(() => {}));

    render(<BasicData />);

    expect(
      screen.getByText("Loading sensor data...")
    ).toBeInTheDocument();
  });

  it("displays sensor reading correctly", async () => {

    (sensorService.sensorService.getLatestReading as any)
      .mockResolvedValue({
        sensorId: "7",
        value: 512,
        timestamp: "2024-01-15T10:30:00Z",
      });

    render(<BasicData />);

    await waitFor(() => {
      expect(screen.getByText(/512/)).toBeInTheDocument();
    });
  });

  it("displays no data state", async () => {

    (sensorService.sensorService.getLatestReading as any)
      .mockResolvedValue(null);

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

    (sensorService.sensorService.getLatestReading as any)
      .mockRejectedValue(new Error("API Error"));

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