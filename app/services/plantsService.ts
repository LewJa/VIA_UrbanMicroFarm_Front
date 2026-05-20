import { MockService, isMockEnabled } from "./mockService";
import api from "../api/client";
import type { Plant } from "../model/plant/types";

export const getPlantsBySetup = async (
  setupId: number,
): Promise<Plant[]> => {
  if (isMockEnabled) return MockService.getPlantsBySetup(setupId);
  const response = await api.get<Plant[]>(
    `/api/growingsetups/${setupId}/plants`,
  );

  return response.data;
};

export const getPlant = async (
  plantId: number,
): Promise<Plant> => {
  if (isMockEnabled) return MockService.getPlant(plantId);
  const response = await api.get<Plant>(
    `/plants/${plantId}`,
  );

  return response.data;
};

export const getPlantBySensor = async (
  sensorId: number,
): Promise<Plant> => {
  if (isMockEnabled) return MockService.getPlantForSensor(sensorId);
  const response = await api.get<Plant>(
    `/sensors/${sensorId}/plant`,
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
  if (isMockEnabled) return MockService.addPlant(plantData);
  const response = await api.post<Plant>(
    "/plants",
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
  if (isMockEnabled) return MockService.updatePlant(plantId, updatedData);
  const response = await api.patch<Plant>(
    `/plants/${plantId}`,
    updatedData,
  );

  return response.data;
};

export const removePlant = async (
  plantId: number,
): Promise<{ message: string }> => {
  if (isMockEnabled) return MockService.removePlant(plantId);
  const response = await api.delete<{ message: string }>(
    `/plants/${plantId}`,
  );

  return response.data;
};

