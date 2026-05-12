import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../../../../api/client";
import {
 
  
  getPlantsBySetup,
 
} from "../plantsService";
import type {
  SetupLatestReading,
  SensorLatestReading,
  Plant,
  SensorReadingHistory,
} from "../../types";

vi.mock("../../../../api/client", () => ({
  default: { get: vi.fn() },
}));

const mockGet = vi.mocked(api.get);

const setupReading: SetupLatestReading = {
  timestamp: "2024-01-15T10:30:00Z",
  temperature: 22,
  humidity: 65,
  light: 800,
};

const sensorReading: SensorLatestReading = {
  sensorId: 7,
  value: 23.5,
  timestamp: "2024-01-15T10:30:00Z",
};

const plants: Plant[] = [
  {
    id: 1,
    name: "Basil",
    description: "Mediterranean herb",
    type: "herb",
    datePlanted: "2024-01-01",
    status: "growing",
  },
];

const readingHistory: SensorReadingHistory = {
  reading: [
    { value: 22.5, timestamp: "2024-01-15T09:00:00Z" },
    { value: 23.0, timestamp: "2024-01-15T10:00:00Z" },
  ],
};

const makeAxiosError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status } });

describe("plantsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  

  

  // ── getPlantsBySetup ──────────────────────────────────────────────────────

  describe("getPlantsBySetup", () => {
    it("hits the correct endpoint", async () => {
      mockGet.mockResolvedValueOnce({ data: plants });
      await getPlantsBySetup(3);
      expect(mockGet).toHaveBeenCalledWith("/growingsetups/3/plants");
    });

    it("returns the response data", async () => {
      mockGet.mockResolvedValueOnce({ data: plants });
      await expect(getPlantsBySetup(3)).resolves.toEqual(plants);
    });

    it("returns an empty array when the setup has no plants", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await expect(getPlantsBySetup(3)).resolves.toEqual([]);
    });

    it("propagates network errors", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));
      await expect(getPlantsBySetup(3)).rejects.toThrow("Network Error");
    });

    it("propagates 401 responses", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(401));
      await expect(getPlantsBySetup(3)).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it("propagates 500 responses", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(500));
      await expect(getPlantsBySetup(3)).rejects.toMatchObject({
        response: { status: 500 },
      });
    });
  });

  
});
