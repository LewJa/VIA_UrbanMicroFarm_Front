import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../../api/client";
import { sensorService } from "../sensorService";
import type { SensorReading, SensorHistoricalReading, SensorPlant } from "../../model/sensor/types";

vi.mock("../../api/client", () => ({
  default: { get: vi.fn() },
}));

const mockGet = vi.mocked(api.get);

const makeAxiosError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status } });

const latestReading: SensorReading = {
  sensorId: "7",
  value: 512,
  timestamp: "2024-01-15T10:30:00Z",
};

const historicalReadings: SensorHistoricalReading[] = [
  { value: 480, timestamp: "2024-01-15T08:00:00Z" },
  { value: 512, timestamp: "2024-01-15T10:00:00Z" },
];

const sensorPlant: SensorPlant = {
  id: 3,
  sensorId: 7,
  name: "Basil",
  description: "Mediterranean herb",
  datePlanted: "2024-01-01",
  status: "growing",
};

describe("sensorService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getLatestReading ──────────────────────────────────────────────────────

  describe("getLatestReading", () => {
    it("hits GET /api/sensors/:sensorId/readings/latest", async () => {
      mockGet.mockResolvedValueOnce({ data: latestReading });
      await sensorService.getLatestReading(7);
      expect(mockGet).toHaveBeenCalledWith("/api/sensors/7/readings/latest");
    });

    it("returns the sensor reading with sensorId, value, and timestamp", async () => {
      mockGet.mockResolvedValueOnce({ data: latestReading });
      const result = await sensorService.getLatestReading(7);
      expect(result).toEqual(latestReading);
    });

    it("propagates 401 errors", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(401));
      await expect(sensorService.getLatestReading(7)).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("propagates 404 errors when sensor does not exist", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(404));
      await expect(sensorService.getLatestReading(999)).rejects.toMatchObject({ response: { status: 404 } });
    });

    it("propagates 500 errors", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(500));
      await expect(sensorService.getLatestReading(7)).rejects.toMatchObject({ response: { status: 500 } });
    });

    it("propagates network errors", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));
      await expect(sensorService.getLatestReading(7)).rejects.toThrow("Network Error");
    });
  });

  // ── getReadings ───────────────────────────────────────────────────────────

  describe("getReadings", () => {
    it("hits GET /api/sensors/:sensorId/readings with no params", async () => {
      mockGet.mockResolvedValueOnce({ data: historicalReadings });
      await sensorService.getReadings(7);
      expect(mockGet).toHaveBeenCalledWith("/api/sensors/7/readings", { params: undefined });
    });

    it("passes plantId, from, and to as query params", async () => {
      mockGet.mockResolvedValueOnce({ data: historicalReadings });
      await sensorService.getReadings(7, {
        plantId: 3,
        from: "2024-01-01T00:00:00Z",
        to: "2024-01-15T00:00:00Z",
      });
      expect(mockGet).toHaveBeenCalledWith("/api/sensors/7/readings", {
        params: { plantId: 3, from: "2024-01-01T00:00:00Z", to: "2024-01-15T00:00:00Z" },
      });
    });

    it("passes only the provided optional params", async () => {
      mockGet.mockResolvedValueOnce({ data: historicalReadings });
      await sensorService.getReadings(7, { plantId: 3 });
      expect(mockGet).toHaveBeenCalledWith("/api/sensors/7/readings", {
        params: { plantId: 3 },
      });
    });

    it("returns an array of historical readings", async () => {
      mockGet.mockResolvedValueOnce({ data: historicalReadings });
      const result = await sensorService.getReadings(7);
      expect(result).toEqual(historicalReadings);
      expect(result).toHaveLength(2);
    });

    it("returns an empty array when no readings exist", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      const result = await sensorService.getReadings(7);
      expect(result).toEqual([]);
    });

    it("propagates 401 errors", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(401));
      await expect(sensorService.getReadings(7)).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("propagates 404 errors when sensor does not exist", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(404));
      await expect(sensorService.getReadings(999)).rejects.toMatchObject({ response: { status: 404 } });
    });

    it("propagates network errors", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));
      await expect(sensorService.getReadings(7)).rejects.toThrow("Network Error");
    });
  });

  // ── getPlant ──────────────────────────────────────────────────────────────

  describe("getPlant", () => {
    it("hits GET /api/sensors/:sensorId/plant", async () => {
      mockGet.mockResolvedValueOnce({ data: sensorPlant });
      await sensorService.getPlant(7);
      expect(mockGet).toHaveBeenCalledWith("/api/sensors/7/plant");
    });

    it("returns the plant assigned to the sensor", async () => {
      mockGet.mockResolvedValueOnce({ data: sensorPlant });
      const result = await sensorService.getPlant(7);
      expect(result).toEqual(sensorPlant);
    });

    it("propagates 401 errors", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(401));
      await expect(sensorService.getPlant(7)).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("propagates 404 when no plant is assigned to the sensor", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(404));
      await expect(sensorService.getPlant(7)).rejects.toMatchObject({ response: { status: 404 } });
    });

    it("propagates 500 errors", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(500));
      await expect(sensorService.getPlant(7)).rejects.toMatchObject({ response: { status: 500 } });
    });

    it("propagates network errors", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));
      await expect(sensorService.getPlant(7)).rejects.toThrow("Network Error");
    });
  });

  // ── getHistoricalReadings ─────────────────────────────────────────────────

  describe("getHistoricalReadings", () => {
    const from = "2024-01-08T00:00:00Z";
    const to = "2024-01-15T00:00:00Z";

    it("hits GET /api/sensors/:sensorId/readings with from and to params", async () => {
      mockGet.mockResolvedValueOnce({ data: historicalReadings });
      await sensorService.getHistoricalReadings(7, { from, to });
      expect(mockGet).toHaveBeenCalledWith("/api/sensors/7/readings", {
        params: { from, to },
      });
    });

    it("returns an array of historical readings", async () => {
      mockGet.mockResolvedValueOnce({ data: historicalReadings });
      const result = await sensorService.getHistoricalReadings(7, { from, to });
      expect(result).toEqual(historicalReadings);
    });

    it("returns an empty array when no readings exist in the range", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      const result = await sensorService.getHistoricalReadings(7, { from, to });
      expect(result).toEqual([]);
    });

    it("propagates 401 errors", async () => {
      mockGet.mockRejectedValueOnce(makeAxiosError(401));
      await expect(
        sensorService.getHistoricalReadings(7, { from, to }),
      ).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("propagates network errors", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));
      await expect(
        sensorService.getHistoricalReadings(7, { from, to }),
      ).rejects.toThrow("Network Error");
    });
  });
});
