import api from "../api/client";
import type { Plant } from "../model/plant/types";
import { isMockEnabled } from "~/mocks";
import { mockPlants } from "~/mocks/plants";

export const getPlantsBySetup = async (
  setupId: number,
): Promise<Plant[]> => {
  if (isMockEnabled) return mockPlants.getPlantsBySetup(setupId);
  const response = await api.get<Plant[]>(
    `/api/growingsetups/${setupId}/plants`,
  );

  return response.data;
};

export const getPlant = async (
  plantId: number,
): Promise<Plant> => {
  if (isMockEnabled) return mockPlants.getPlant(plantId);
  const response = await api.get<Plant>(
    `/api/plants/${plantId}`,
  );

  return response.data;
};

export const getPlantBySensor = async (
  sensorId: number,
): Promise<Plant> => {
  if (isMockEnabled) return mockPlants.getPlantForSensor(sensorId);
  const response = await api.get<Plant>(
    `/api/sensors/${sensorId}/plant`,
  );

  return response.data;
};

export const addPlant = async (
  plantData: {
    sensorId: number;
    name: string;
    type: string;
    description: string;
  },
): Promise<Plant> => {
  if (isMockEnabled) return mockPlants.addPlant(plantData);
  const response = await api.post<Plant>(
    "/api/plants",
    plantData,
  );

  return response.data;
};

export const updatePlant = async (
  plantId: number,
  updatedData: {
    name?: string;
    description?: string;
  },
): Promise<Plant> => {
  if (isMockEnabled) return mockPlants.updatePlant(plantId, updatedData);
  const response = await api.patch<Plant>(
    `/api/plants/${plantId}`,
    updatedData,
  );

  return response.data;
};

export const removePlant = async (
  plantId: number,
): Promise<{ message: string }> => {
  if (isMockEnabled) return mockPlants.removePlant(plantId);
  const response = await api.delete<{ message: string }>(
    `/api/plants/${plantId}`,
  );

  return response.data;
};

