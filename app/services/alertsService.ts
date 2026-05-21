import api from "../api/client";
import type {
  Alert,
  AlertsFilter,
  SetupThresholds,
  UpdateAlertStatusRequest,
  UpdateAlertStatusResponse,
  UpdateThresholdsRequest,
} from "../model/alerts/types";
import { isMockEnabled } from "~/mocks";
import { mockAlerts } from "~/mocks/alerts";

export const alertsService = {
  getAlerts: async (userId: number, filter?: AlertsFilter): Promise<Alert[]> => {
    if (isMockEnabled) return mockAlerts.getAlerts(userId, filter);
    const response = await api.get<Alert[]>(`/api/users/${userId}/alerts`, { params: filter });
    return response.data;
  },

  getAlert: async (alertId: number): Promise<Alert> => {
    if (isMockEnabled) return mockAlerts.getAlert(alertId);
    const response = await api.get<Alert>(`/api/alerts/${alertId}`);
    return response.data;
  },

  updateAlertStatus: async (alertId: number, status: "read" | "dismissed"): Promise<UpdateAlertStatusResponse> => {
    if (isMockEnabled) return mockAlerts.updateAlertStatus(alertId, status);
    const body: UpdateAlertStatusRequest = { status };
    const response = await api.patch<UpdateAlertStatusResponse>(`/api/alerts/${alertId}/status`, body);
    return response.data;
  },

  getThresholds: async (setupId: number): Promise<SetupThresholds> => {
    if (isMockEnabled) return mockAlerts.getThresholds(setupId);
    const response = await api.get<SetupThresholds>(`/api/growingsetups/${setupId}/thresholds`);
    return response.data;
  },

  updateThresholds: async (setupId: number, updates: UpdateThresholdsRequest): Promise<SetupThresholds> => {
    if (isMockEnabled) return mockAlerts.updateThresholds(setupId, updates);
    const response = await api.patch<SetupThresholds>(`/api/growingsetups/${setupId}/thresholds`, updates);
    return response.data;
  },
};
