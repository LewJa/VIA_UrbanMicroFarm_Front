import api from "../api/client";
import type {
  SensorReading,
  SensorHistoricalReading,
  SensorReadingsParams,
  SensorPlant,
} from "../model/sensor/types";
import { MockService, isMockEnabled } from "./mockService";

export const sensorService = {
  getLatestReading: async (sensorId: number): Promise<SensorReading> => {
    if (isMockEnabled) return MockService.getLatestReading(sensorId);
    const response = await api.get<SensorReading>(`/api/sensors/${sensorId}/readings/latest`);
    return response.data;
  },

  getReadings: async (sensorId: number, params?: SensorReadingsParams): Promise<SensorHistoricalReading[]> => {
    if (isMockEnabled) return MockService.getReadings(sensorId);
    const response = await api.get<SensorHistoricalReading[]>(`/api/sensors/${sensorId}/readings`, { params });
    return response.data;
  },

  getHistoricalReadings: async (
    sensorId: number,
    { from, to }: { from: string; to: string },
  ): Promise<SensorHistoricalReading[]> => {
    if (isMockEnabled) return MockService.getHistoricalReadings(sensorId, from, to);
    const response = await api.get<SensorHistoricalReading[]>(
      `/api/sensors/${sensorId}/readings`,
      { params: { from, to } },
    );
    return response.data;
  },

  getPlant: async (sensorId: number): Promise<SensorPlant> => {
    if (isMockEnabled) return MockService.getPlant(sensorId);
    const response = await api.get<SensorPlant>(`/api/sensors/${sensorId}/plant`);
    return response.data;
  },
};
