import type { SensorReading, SensorHistoricalReading, SensorPlant } from "~/model/sensor/types";

export const mockSensors = {
  getLatestReading: async (sensorId: number): Promise<SensorReading> =>
    ({ sensorId, value: 850.5, timestamp: new Date().toISOString() } as unknown as SensorReading),

  getReadings: async (_sensorId: number): Promise<SensorHistoricalReading[]> => [
    { value: 900.0, timestamp: new Date(Date.now() - 7_200_000).toISOString() },
    { value: 850.5, timestamp: new Date(Date.now() - 3_600_000).toISOString() },
    { value: 800.0, timestamp: new Date().toISOString() },
  ],

  getHistoricalReadings: async (_sensorId: number, from: string, to: string): Promise<SensorHistoricalReading[]> => {
    const fromMs = Date.parse(from);
    const toMs = Date.parse(to);
    const intervalMs = 2 * 60 * 60 * 1000;
    const readings: SensorHistoricalReading[] = [];
    let base = 600;
    for (let t = fromMs; t <= toMs; t += intervalMs) {
      base = Math.min(1023, Math.max(0, base + (Math.random() - 0.48) * 60));
      readings.push({ value: Math.round(base), timestamp: new Date(t).toISOString() });
    }
    return readings;
  },

  getPlant: async (sensorId: number): Promise<SensorPlant> =>
    ({ id: 1, name: "Tomato", description: "Cherry tomato", type: "Vegetable", datePlanted: "2026-04-10", status: "Healthy", sensorId } as unknown as SensorPlant),
};
