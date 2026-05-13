import api from "../api/client";
import type { Plant } from "~/model/plant/types";


export const getPlantsBySetup = async (
  setupId: number,
): Promise<Plant[]> => {
  const response = await api.get<Plant[]>(
    `/growingsetups/${setupId}/plants`,
  );

  return response.data;
};




export const getPlant = async (
  plantId: number,
): Promise<Plant> => {
  const response = await api.get<Plant>(
    `/plants/${plantId}`,
  );

  return response.data;
};




export const getPlantBySensor = async (
  sensorId: number,
): Promise<Plant> => {
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
  const response = await api.patch<Plant>(
    `/plants/${plantId}`,
    updatedData,
  );

  return response.data;
};




export const removePlant = async (
  plantId: number,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/plants/${plantId}`,
  );

  return response.data;
};

