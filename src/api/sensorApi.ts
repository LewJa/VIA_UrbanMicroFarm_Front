import api from "./client.js";


export interface SensorReading {
  sensorId: string;
  value: number;
  timestamp: string;
}


export const getLatestSensorReading = async (
  sensorId: string
): Promise<SensorReading> => {
  const response = await api.get<SensorReading>(
    `/sensors/${sensorId}/latest`
  );
  return response.data;
};