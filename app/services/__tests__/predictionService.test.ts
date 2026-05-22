import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../../api/client";
import { predictionService } from "../predictionService";
import type { Prediction } from "~/model/prediction/types";

vi.mock("../../api/client", () => ({
  default: { get: vi.fn() },
}));
vi.mock("~/mocks/index", () => ({ isMockEnabled: false }));

const mockGet = vi.mocked(api.get);

const predictions: Prediction[] = [
  { predictionId: 1, predictedValue: 1.2, createdAt: "2024-01-25T10:00:00.000Z", plantName: "Basil" },
  { predictionId: 2, predictedValue: 0.9, createdAt: "2024-01-26T10:00:00.000Z", plantName: "Basil" },
];

describe("predictionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPredictions", () => {
    it("calls the correct API endpoint for the given plantId", async () => {
      mockGet.mockResolvedValueOnce({ data: predictions });
      await predictionService.getPredictions(5);
      expect(mockGet).toHaveBeenCalledWith("/api/plants/5/predictions");
    });

    it("returns the predictions array from the response", async () => {
      mockGet.mockResolvedValueOnce({ data: predictions });
      await expect(predictionService.getPredictions(5)).resolves.toEqual(predictions);
    });

    it("returns an empty array when the plant has no predictions yet", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await expect(predictionService.getPredictions(5)).resolves.toEqual([]);
    });

    it("propagates network errors to the caller", async () => {
      const error = new Error("Network Error");
      mockGet.mockRejectedValueOnce(error);
      await expect(predictionService.getPredictions(5)).rejects.toThrow("Network Error");
    });
  });
});
