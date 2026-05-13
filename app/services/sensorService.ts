import api from "../api/client";
import type {
  SensorReading,
  SensorHistoricalReading,
  SensorReadingsParams,
  SensorPlant,
} from "../model/sensor/types";

export const sensorService = {
  getLatestReading: async (sensorId: number): Promise<SensorReading> => {
    const response = await api.get<SensorReading>(`/api/sensors/${sensorId}/readings/latest`);
    return response.data;
  },

  getReadings: async (sensorId: number, params?: SensorReadingsParams): Promise<SensorHistoricalReading[]> => {
    const response = await api.get<SensorHistoricalReading[]>(`/api/sensors/${sensorId}/readings`, { params });
    return response.data;
  },

  getPlant: async (sensorId: number): Promise<SensorPlant> => {
    const response = await api.get<SensorPlant>(`/api/sensors/${sensorId}/plant`);
    return response.data;
  },
};
