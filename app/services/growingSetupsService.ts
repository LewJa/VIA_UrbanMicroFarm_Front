import api from "../api/client";
import type {GrowingSetup, SetupReading, MoistureSensor, Sensor} from "../model/growingSetup/types";
import { isMockEnabled } from "~/mocks";
import { mockGrowingSetups } from "~/mocks/growingSetups";

export const growingSetupsService = {
  assignSetupToUser: async (userId: number, setupId: number): Promise<{ growingSetup: GrowingSetup }> => {
    if (isMockEnabled) return mockGrowingSetups.assignSetupToUser(userId, setupId);
    const response = await api.post<{ growingSetup: GrowingSetup }>("/api/growingsetups", { userId, setupId });
    return response.data;
  },

  updateSetupLocation: async (setupId: number, location: string): Promise<{ growingSetup: GrowingSetup }> => {
    if (isMockEnabled) return mockGrowingSetups.updateSetupLocation(setupId, location);
    const response = await api.patch<{ growingSetup: GrowingSetup }>(`/api/growingsetups/${setupId}`, { location });
    return response.data;
  },

  disconnectSetupFromUser: async (setupId: number): Promise<{ message: string }> => {
    if (isMockEnabled) return mockGrowingSetups.disconnectSetupFromUser(setupId);
    const response = await api.delete<{ message: string }>(`/api/growingsetups/${setupId}`);
    return response.data;
  },

  getSetupsByUserID: async (userId: number): Promise<GrowingSetup[]> => {
    if (isMockEnabled) return mockGrowingSetups.getSetupsByUserID(userId);
    const response = await api.get<GrowingSetup[]>("/api/growingsetups", { params: { userId } });
    return response.data;
  },

  getSetupSensorReadings: async (setupId: number): Promise<SetupReading> => {
    if (isMockEnabled) return mockGrowingSetups.getSetupSensorReadings(setupId);
    const response = await api.get<SetupReading>(`/api/growingsetups/${setupId}/readings/latest`);
    return response.data;
  },

  fetchAllAssignedSensors: async (setupId: number): Promise<Sensor[]> => {
    if (isMockEnabled) return mockGrowingSetups.fetchAllAssignedSensors(setupId);
    const response = await api.get<Sensor[]>(`/api/growingsetups/${setupId}/sensors`);
    return response.data;
  },

  // TODO: replace with GET /api/growingsetups/{setupId} once backend exposes a single-setup endpoint
  getSetupById: async (setupId: number, userId: number): Promise<GrowingSetup | null> => {
    const setups = await growingSetupsService.getSetupsByUserID(userId);
    return setups.find((s) => s.id === setupId) ?? null;
  },
};