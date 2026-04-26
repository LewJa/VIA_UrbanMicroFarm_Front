import api from "../../../api/client.js";
import type { SensorReading } from "../types.js";

export const getLatestSensorReading = async (
  sensorId: string
): Promise<SensorReading> => {
  const response = await api.get<SensorReading>(
    `/sensors/${sensorId}/latest`
  );
  return response.data;
};
