import api from "../../../api/client";
import type { SensorReading } from "../types";

export const getLatestSensorReading = async (
  setupId: number,
  sensorType: string,
): Promise<SensorReading> => {
  const response = await api.get<SensorReading>(
    `/setups/${setupId}/sensors/${sensorType}/latest`,
  );
  return response.data;
};
