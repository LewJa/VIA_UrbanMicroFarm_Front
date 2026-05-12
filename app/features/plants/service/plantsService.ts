// TODO: PlantService implemented
import api from "../../../api/client.js";
import type {
  SetupLatestReading,
  SensorLatestReading,
  Plant,
  SensorReadingHistory,
} from "../types.js";





// 🌡️ Get latest sensor reading

export const getLatestSensorReading = async (
  sensorId: number,
): Promise<SensorLatestReading> => {
  const response = await api.get<SensorLatestReading>(
    `/sensors/${sensorId}/readings/latest`,
  );

  return response.data;
};


// 📊 Get sensor reading history

export const getSensorReadingHistory = async (
  sensorId: number,
): Promise<SensorReadingHistory> => {
  const response = await api.get<SensorReadingHistory>(
    `/sensors/${sensorId}/readings`,
  );

  return response.data;
};


// 🌿 Get all plants in a setup

export const getPlantsBySetup = async (
  setupId: number,
): Promise<Plant[]> => {
  const response = await api.get<Plant[]>(
    `/growingsetups/${setupId}/plants`,
  );

  return response.data;
};


// 🌱 Get a single plant by ID

export const getPlant = async (
  plantId: number,
): Promise<Plant> => {
  const response = await api.get<Plant>(
    `/plants/${plantId}`,
  );

  return response.data;
};


// 🌱 Get plant by sensor ID

export const getPlantBySensor = async (
  sensorId: number,
): Promise<Plant> => {
  const response = await api.get<Plant>(
    `/sensors/${sensorId}/plant`,
  );

  return response.data;
};


// 🌱 Add new plant

export const addPlant = async (
  plantData: {
    sensorId: number;
    name: string;
    type: string;
    description: string;
  },
): Promise<Plant> => {
  const response = await api.post<Plant>(
    "/plants",
    plantData,
  );

  return response.data;
};


// 🌱 Update plant

export const updatePlant = async (
  plantId: number,
  updatedData: {
    name?: string;
    description?: string;
  },
): Promise<Plant> => {
  const response = await api.patch<Plant>(
    `/plants/${plantId}`,
    updatedData,
  );

  return response.data;
};


// 🌱 Remove plant

export const removePlant = async (
  plantId: number,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/plants/${plantId}`,
  );

  return response.data;
};


