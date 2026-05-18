import type { WateringEvent } from "~/model/growingSetup/types";

const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const min = 60 * 1000;

export const MOCK_WATERING_EVENTS: WateringEvent[] = [
  {
    eventId: 1,
    startTime: new Date(now - 28 * day).toISOString(),
    endTime: new Date(now - 28 * day + 45 * min).toISOString(),
    waterUsedLiters: 0.5,
    mode: "automatic",
  },
  {
    eventId: 2,
    startTime: new Date(now - 21 * day).toISOString(),
    endTime: new Date(now - 21 * day + 30 * min).toISOString(),
    waterUsedLiters: 1.2,
    mode: "manual",
  },
  {
    eventId: 3,
    startTime: new Date(now - 14 * day).toISOString(),
    endTime: new Date(now - 14 * day + 45 * min).toISOString(),
    waterUsedLiters: 0.5,
    mode: "automatic",
  },
  {
    eventId: 4,
    startTime: new Date(now - 6 * day).toISOString(),
    endTime: new Date(now - 6 * day + 30 * min).toISOString(),
    waterUsedLiters: 0.8,
    mode: "manual",
  },
  {
    eventId: 5,
    startTime: new Date(now - 2 * day).toISOString(),
    endTime: new Date(now - 2 * day + 45 * min).toISOString(),
    waterUsedLiters: 0.5,
    mode: "automatic",
  },
];
