import api from "../../../api/client.js";
import type {
  SetupLatestReading,
  SensorLatestReading,
  Plant,
  SensorReadingHistory,
} from "../types.js";

export const getLatestSetupReadings = async (
  setupId: number,
): Promise<SetupLatestReading> => {
  const response = await api.get<SetupLatestReading>(
    `/growingsetups/${setupId}/readings/latest`,
  );
  return response.data;
};

export const getLatestSensorReading = async (
  sensorId: number,
): Promise<SensorLatestReading> => {
  const response = await api.get<SensorLatestReading>(
    `/sensors/${sensorId}/readings/latest`,
  );
  return response.data;
};

export const getPlantsBySetup = async (setupId: number): Promise<Plant[]> => {
  const response = await api.get<Plant[]>(`/growingsetups/${setupId}/plants`);
  return response.data;
};

export const getSensorReadingHistory = async (
  sensorId: number,
): Promise<SensorReadingHistory> => {
  const response = await api.get<SensorReadingHistory>(
    `/sensors/${sensorId}/readings`,
  );
  return response.data;
};
