import api from "../api/client";
import type { WateringEvent } from "../model/growingSetup/types";

export const wateringService = {
  triggerManualWatering: async (plantId: number): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/api/plants/${plantId}/watering/manual`);
    return response.data;
  },

  getLastWateringEvent: async (setupId: number): Promise<WateringEvent> => {
    const response = await api.get<WateringEvent>(`/api/growingsetups/${setupId}/wateringEvents/latest`);
    return response.data;
  },

  getHistoricalWateringEvents: async (setupId: number, from?: string, to?: string): Promise<WateringEvent[]> => {
    const response = await api.get<WateringEvent[]>(`/api/growingsetups/${setupId}/wateringEvents`, { params: { from, to } });
    return response.data;
  },
};
