import api from "../api/client";
import type { WateringEvent } from "../model/growingSetup/types";
import { MockService, isMockEnabled } from "./mockService";

export const wateringService = {
  triggerManualWatering: async (plantId: number): Promise<{ message: string }> => {
    if (isMockEnabled) return MockService.triggerManualWatering(plantId);
    const response = await api.post<{ message: string }>(`/api/plants/${plantId}/watering/manual`);
    return response.data;
  },

  getLastWateringEvent: async (setupId: number): Promise<WateringEvent> => {
    if (isMockEnabled) return MockService.getLastWateringEvent(setupId);
    const response = await api.get<WateringEvent>(`/api/growingsetups/${setupId}/wateringEvents/latest`);
    return response.data;
  },

  getHistoricalWateringEvents: async (setupId: number, from?: string, to?: string): Promise<WateringEvent[]> => {
    if (isMockEnabled) return MockService.getHistoricalWateringEvents(setupId);
    const response = await api.get<WateringEvent[]>(`/api/growingsetups/${setupId}/wateringEvents`, { params: { from, to } });
    return response.data;
  },
};
