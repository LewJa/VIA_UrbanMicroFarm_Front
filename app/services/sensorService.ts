import api from "../api/client";
import type {
  SensorReading,
  SensorHistoricalReading,
  SensorReadingsParams,
  SensorPlant,
} from "../model/sensor/types";
import { isMockEnabled } from "~/mocks";
import { mockSensors } from "~/mocks/sensors";

export const sensorService = {
  getLatestReading: async (sensorId: number): Promise<SensorReading> => {
    if (isMockEnabled) return mockSensors.getLatestReading(sensorId);
    const response = await api.get<SensorReading>(`/api/sensors/${sensorId}/readings/latest`);
    return response.data;
  },

  getReadings: async (sensorId: number, params?: SensorReadingsParams): Promise<SensorHistoricalReading[]> => {
    if (isMockEnabled) return mockSensors.getReadings(sensorId);
    const response = await api.get<SensorHistoricalReading[]>(`/api/sensors/${sensorId}/readings`, { params });
    return response.data;
  },

  getHistoricalReadings: async (
    sensorId: number,
    { from, to }: { from: string; to: string },
  ): Promise<SensorHistoricalReading[]> => {
    if (isMockEnabled) return mockSensors.getHistoricalReadings(sensorId, from, to);
    const response = await api.get<SensorHistoricalReading[]>(
      `/api/sensors/${sensorId}/readings`,
      { params: { from, to } },
    );
    return response.data;
  },

  getPlant: async (sensorId: number): Promise<SensorPlant> => {
    if (isMockEnabled) return mockSensors.getPlant(sensorId);
    const response = await api.get<SensorPlant>(`/api/sensors/${sensorId}/plant`);
    return response.data;
  },
};
