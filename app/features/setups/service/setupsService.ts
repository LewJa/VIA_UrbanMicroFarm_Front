import api from "../../../api/client";
import type { GrowingSetup, SetupReading, WateringEvent, MoistureSensor } from "../types";

export const setupsService = {
  assignSetupToUser: async (userId: number, setupId: number): Promise<{ growingsetup: GrowingSetup }> => {
    const response = await api.post<{ growingsetup: GrowingSetup }>("/growingsetups", { userId, setupId });
    return response.data;
  },
//There's inconsistency between word and figma but I went with "disconnect" from the word.
  disconnectSetupFromUser: async (userId: number, setupId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/growingsetups/${setupId}`, { data: { userId } });
    return response.data;
  },

  getSetupsByUserID: async (userId: number): Promise<{ growingsetup: GrowingSetup }[]> => {
    const response = await api.get<{ growingsetup: GrowingSetup }[]>("/growingsetups", { params: { userId } });
    return response.data;
  },

  getSetupSensorReadings: async (setupId: number): Promise<{ reading: SetupReading }[]> => {
    const response = await api.get<{ reading: SetupReading }[]>(`/growingsetups/${setupId}/readings/latest`);
    return response.data;
  },

  triggerManualWatering: async (setupId: number, isManual: boolean): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/growingsetups/${setupId}/manualWatering`, { manual: isManual });
    return response.data;
  },

  isManualWatering: async (setupId: number): Promise<{ boolean: boolean }> => {
    const response = await api.get<{ boolean: boolean }>(`/growingsetups/${setupId}/manualWatering`);
    return response.data;
  },

  getLastWateringEvent: async (setupId: number): Promise<WateringEvent> => {
    const response = await api.get<WateringEvent>(`/growingsetups/${setupId}/wateringEvents/latest`);
    return response.data;
  },

  getHistoricalWateringEvents: async (setupId: number): Promise<{ wateringEvent: WateringEvent }[]> => {
    const response = await api.get<{ wateringEvent: WateringEvent }[]>(`/growingsetups/${setupId}/wateringEvents`);
    return response.data;
  },

  fetchAllAssignedSensors: async (setupId: number): Promise<{ moistureSensor: MoistureSensor }[]> => {
    const response = await api.get<{ moistureSensor: MoistureSensor }[]>(`/growingsetups/${setupId}/sensors`);
    return response.data;
  },
};