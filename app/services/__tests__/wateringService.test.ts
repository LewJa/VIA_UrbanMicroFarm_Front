import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { WateringEvent } from "~/model/growingSetup/types";

const MOCK_EVENTS: WateringEvent[] = vi.hoisted(() => []);

vi.mock("~/mocks/wateringEvents", () => ({ MOCK_WATERING_EVENTS: MOCK_EVENTS }));
vi.mock("~/api/client", () => ({ default: { get: vi.fn() } }));
vi.mock("~/mocks/index", () => ({ isMockEnabled: false }));

import api from "~/api/client";
import { wateringService } from "~/services/wateringService";

const mockGet = vi.mocked(api.get);

const FROM = "2024-01-10T12:00:00.000Z";
const TO   = "2024-01-17T12:00:00.000Z";
const fromMs = Date.parse(FROM);
const toMs   = Date.parse(TO);

function makeEvent(id: number, createdAtMs: number): WateringEvent {
  return {
    id,
    waterUsedMl: 284,
    mode: "automatic",
    createdAt: new Date(createdAtMs).toISOString(),
  };
}

describe("wateringService.getHistoricalWateringEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MOCK_EVENTS.length = 0;
  });

  describe("flag off (VITE_WATERING_EVENTS_ENABLED not set)", () => {
    it("includes events whose createdAt falls exactly on from/to boundaries and excludes those 1 ms outside", async () => {
      MOCK_EVENTS.push(
        makeEvent(1, fromMs),      // exactly at FROM → included
        makeEvent(2, toMs),        // exactly at TO → included
        makeEvent(3, fromMs - 1),  // 1 ms before FROM → excluded
        makeEvent(4, toMs + 1),    // 1 ms after TO → excluded
      );
      const result = await wateringService.getHistoricalWateringEvents(1, FROM, TO);
      expect(result.map((e) => e.id)).toEqual([1, 2]);
    });

    it("returns all events when from and to are omitted", async () => {
      MOCK_EVENTS.push(makeEvent(1, fromMs), makeEvent(2, toMs));
      const result = await wateringService.getHistoricalWateringEvents(1);
      expect(result).toHaveLength(2);
    });
  });

  describe("flag on (VITE_WATERING_EVENTS_ENABLED=true)", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_WATERING_EVENTS_ENABLED", "true");
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("calls the API with the correct path and query params", async () => {
      mockGet.mockResolvedValue({ data: [] });
      await wateringService.getHistoricalWateringEvents(42, FROM, TO);
      expect(mockGet).toHaveBeenCalledWith(
        "/api/growingsetups/42/wateringEvents",
        { params: { from: FROM, to: TO } },
      );
    });
  });
});
