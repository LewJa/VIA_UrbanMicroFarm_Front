import type { WateringEvent } from "~/model/growingSetup/types";

const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const min = 60 * 1000;

export const MOCK_WATERING_EVENTS: WateringEvent[] = [
  { id: 1, waterUsedMl: 284, mode: "manual",    createdAt: "2026-05-15T08:00:00Z" },
  { id: 2, waterUsedMl: 310, mode: "automatic", createdAt: "2026-05-16T10:30:00Z" },
  { id: 3, waterUsedMl: 295, mode: "automatic", createdAt: "2026-05-18T13:00:00Z" },
  { id: 4, waterUsedMl: 320, mode: "manual",    createdAt: "2026-05-20T15:30:00Z" },
];

export const mockWatering = {
  triggerManualWatering: async (_plantId: number): Promise<{ message: string }> => ({
    message: "Watering triggered successfully (MOCK)",
  }),

  getLastWateringEvent: async (_setupId: number): Promise<WateringEvent> => ({
    id: MOCK_WATERING_EVENTS[MOCK_WATERING_EVENTS.length - 1].id,
    createdAt: new Date(Date.now() - 60_000).toISOString(),
    waterUsedMl: 0.5,
    mode: "manual",
  }),

  getHistoricalWateringEvents: async (_setupId: number): Promise<WateringEvent[]> =>
    MOCK_WATERING_EVENTS,
};
