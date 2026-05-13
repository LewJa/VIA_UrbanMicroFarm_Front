import api from "../api/client";
import type { GrowingSetup, SetupReading, MoistureSensor } from "../model/growingSetup/types";

export const growingSetupsService = {
  assignSetupToUser: async (userId: number, setupId: number): Promise<{ growingSetup: GrowingSetup }> => {
    const response = await api.post<{ growingSetup: GrowingSetup }>("/api/growingsetups", { userId, setupId });
    return response.data;
  },

  updateSetupLocation: async (setupId: number, location: string): Promise<{ growingSetup: GrowingSetup }> => {
    const response = await api.patch<{ growingSetup: GrowingSetup }>(`/api/growingsetups/${setupId}`, { location });
    return response.data;
  },

  disconnectSetupFromUser: async (setupId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/api/growingsetups/${setupId}`);
    return response.data;
  },

  getSetupsByUserID: async (userId: number): Promise<GrowingSetup[]> => {
    const response = await api.get<GrowingSetup[]>("/api/growingsetups", { params: { userId } });
    return response.data;
  },

  getSetupSensorReadings: async (setupId: number): Promise<SetupReading> => {
    const response = await api.get<SetupReading>(`/api/growingsetups/${setupId}/readings/latest`);
    return response.data;
  },

  fetchAllAssignedSensors: async (setupId: number): Promise<MoistureSensor[]> => {
    const response = await api.get<MoistureSensor[]>(`/api/growingsetups/${setupId}/sensors`);
    return response.data;
  },
};