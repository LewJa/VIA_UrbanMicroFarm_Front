// TODO: PlantService implemented
import api from "../api/client";
import type {
  SetupLatestReading,
  SensorLatestReading,
  Plant,
  SensorReadingHistory,
} from "../model/plant/types";


// 🌱 Get latest readings for setup

export const getLatestSetupReadings = async (
  setupId: number,
): Promise<SetupLatestReading> => {
  const response = await api.get<SetupLatestReading>(
    `/growingsetups/${setupId}/readings/latest`,
  );
  return response.data;
};


// 🌡️ Get latest sensor reading
// TODO: superseded by sensorService.getLatestReading — remove this once callers are migrated

export const getLatestSensorReading = async (
  sensorId: number,
): Promise<SensorLatestReading> => {
  const response = await api.get<SensorLatestReading>(
    `/sensors/${sensorId}/readings/latest`,
  );
  return response.data;
};


// 🌿 Get plants in a setup

export const getPlantsBySetup = async (
  setupId: number,
): Promise<Plant[]> => {
  const response = await api.get<Plant[]>(
    `/growingsetups/${setupId}/plants`,
  );
  return response.data;
};


// 📊 Get sensor reading history
// TODO: superseded by sensorService.getReadings — remove this once callers are migrated

export const getSensorReadingHistory = async (
  sensorId: number,
): Promise<SensorReadingHistory> => {
  const response = await api.get<SensorReadingHistory>(
    `/sensors/${sensorId}/readings`,
  );
  return response.data;
};


// 💧 Trigger manual watering ⭐

export const triggerManualWatering = async (
  plantId: number,
): Promise<void> => {
  await api.post(`/plants/${plantId}/water`);
};