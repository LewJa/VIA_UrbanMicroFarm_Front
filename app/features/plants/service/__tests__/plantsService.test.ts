import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../../../../api/client";
import {
  getPlantById,
  getLatestSetupReadings,
  getLatestSensorReading,
  getPlantsBySetup,
  getSensorReadingHistory,
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
    sensorId: 10,
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

  // ── getLatestSetupReadings ────────────────────────────────────────────────

  describe("getLatestSetupReadings", () => {
    it("hits the correct endpoint", async () => {
      mockGet.mockResolvedValueOnce({ data: setupReading });
      await getLatestSetupReadings(42);
      expect(mockGet).toHaveBeenCalledWith("/growingsetups/42/readings/latest");
    });

    it("returns the response data", async () => {
      mockGet.mockResolvedValueOnce({ data: setupReading });
      await expect(getLatestSetupReadings(1)).resolves.toEqual(setupReading);
    });

    it("propagates network errors", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));
      await expect(getLatestSetupReadings(1)).rejects.toThrow("Network Error");
    });

    it("propagates 401 responses", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(401));
      await expect(getLatestSetupReadings(1)).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it("propagates 500 responses", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(500));
      await expect(getLatestSetupReadings(1)).rejects.toMatchObject({
        response: { status: 500 },
      });
    });
  });

  // ── getLatestSensorReading ────────────────────────────────────────────────

  describe("getLatestSensorReading", () => {
    it("hits the correct endpoint", async () => {
      mockGet.mockResolvedValueOnce({ data: sensorReading });
      await getLatestSensorReading(7);
      expect(mockGet).toHaveBeenCalledWith("/sensors/7/readings/latest");
    });

    it("returns the response data", async () => {
      mockGet.mockResolvedValueOnce({ data: sensorReading });
      await expect(getLatestSensorReading(7)).resolves.toEqual(sensorReading);
    });

    it("propagates network errors", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));
      await expect(getLatestSensorReading(7)).rejects.toThrow("Network Error");
    });

    it("propagates 401 responses", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(401));
      await expect(getLatestSensorReading(7)).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it("propagates 500 responses", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(500));
      await expect(getLatestSensorReading(7)).rejects.toMatchObject({
        response: { status: 500 },
      });
    });
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

  // ── getSensorReadingHistory ───────────────────────────────────────────────

  describe("getSensorReadingHistory", () => {
    it("hits the correct endpoint", async () => {
      mockGet.mockResolvedValueOnce({ data: readingHistory });
      await getSensorReadingHistory(5);
      expect(mockGet).toHaveBeenCalledWith("/sensors/5/readings");
    });

    it("returns the response data including all readings", async () => {
      mockGet.mockResolvedValueOnce({ data: readingHistory });
      const result = await getSensorReadingHistory(5);
      expect(result).toEqual(readingHistory);
      expect(result.reading).toHaveLength(2);
    });

    it("propagates network errors", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));
      await expect(getSensorReadingHistory(5)).rejects.toThrow("Network Error");
    });

    it("propagates 401 responses", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(401));
      await expect(getSensorReadingHistory(5)).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it("propagates 500 responses", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(500));
      await expect(getSensorReadingHistory(5)).rejects.toMatchObject({
        response: { status: 500 },
      });
    });
  });

  // ── getPlantById ──────────────────────────────────────────────────────────

  describe("getPlantById", () => {
    const plant: Plant = {
      id: 7,
      sensorId: 42,
      name: "Basil",
      description: "Mediterranean herb",
      type: "herb",
      datePlanted: "2024-01-01",
      status: "growing",
    };

    it("hits GET /api/plants/:plantId", async () => {
      mockGet.mockResolvedValueOnce({ data: plant });
      await getPlantById(7);
      expect(mockGet).toHaveBeenCalledWith("/api/plants/7");
    });

    it("returns the plant including sensorId", async () => {
      mockGet.mockResolvedValueOnce({ data: plant });
      const result = await getPlantById(7);
      expect(result).toEqual(plant);
      expect(result.sensorId).toBe(42);
    });

    it("sensorId is distinct from plant id", async () => {
      mockGet.mockResolvedValueOnce({ data: plant });
      const result = await getPlantById(7);
      expect(result.id).toBe(7);
      expect(result.sensorId).toBe(42);
      expect(result.id).not.toBe(result.sensorId);
    });

    it("propagates 404 when plant does not exist", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(404));
      await expect(getPlantById(999)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it("propagates 401 errors", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(401));
      await expect(getPlantById(7)).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it("propagates network errors", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));
      await expect(getPlantById(7)).rejects.toThrow("Network Error");
    });
  });
});
