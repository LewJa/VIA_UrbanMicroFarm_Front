import type {
  Alert,
  AlertsFilter,
  SetupThresholds,
  UpdateThresholdsRequest,
} from "~/model/alerts/types";

const now = Date.now();
const min = 60 * 1000;
const hour = 60 * min;
const day = 24 * hour;

let MOCK_ALERTS: Alert[] = [
  {
    id: 1,
    type: "MOISTURE_LOW",
    severity: "warning",
    message: "Soil moisture dropped below threshold",
    setupId: 1,
    plantId: 3,
    sensorId: 2,
    status: "unread",
    triggeredAt: new Date(now - 5 * min).toISOString(),
  },
  {
    id: 2,
    type: "WATER_THRESHOLD_EXCEEDED",
    severity: "critical",
    message: "Water consumption exceeded the configured maximum",
    setupId: 1,
    plantId: null,
    sensorId: 2,
    status: "unread",
    triggeredAt: new Date(now - 30 * min).toISOString(),
  },
  {
    id: 3,
    type: "SENSOR_MALFUNCTION",
    severity: "critical",
    message: "Sensor is not reporting — check connection",
    setupId: 2,
    plantId: null,
    sensorId: 5,
    status: "unread",
    triggeredAt: new Date(now - 2 * hour).toISOString(),
  },
  {
    id: 4,
    type: "MOISTURE_LOW",
    severity: "warning",
    message: "Soil moisture is low — consider watering",
    setupId: 1,
    plantId: 4,
    sensorId: 2,
    status: "read",
    triggeredAt: new Date(now - 5 * hour).toISOString(),
  },
  {
    id: 5,
    type: "MOISTURE_LOW",
    severity: "info",
    message: "Moisture approaching minimum threshold",
    setupId: 2,
    plantId: 7,
    sensorId: 5,
    status: "read",
    triggeredAt: new Date(now - day).toISOString(),
  },
  {
    id: 6,
    type: "WATER_THRESHOLD_EXCEEDED",
    severity: "warning",
    message: "Water consumption is nearing the configured limit",
    setupId: 2,
    plantId: null,
    sensorId: 5,
    status: "dismissed",
    triggeredAt: new Date(now - 3 * day).toISOString(),
  },
];

const MOCK_THRESHOLDS: Record<number, SetupThresholds> = {
  1: {
    setupId: 1,
    moistureMin: 300,
    waterConsumptionMaxLiters: 5,
    baselineWaterLiters: 3.2,
  },
  2: {
    setupId: 2,
    moistureMin: 250,
    waterConsumptionMaxLiters: 8,
    baselineWaterLiters: 6.1,
  },
};

function matchesFilter(alert: Alert, filter?: AlertsFilter): boolean {
  if (!filter) return true;
  if (filter.status && alert.status !== filter.status) return false;
  if (filter.setupId !== undefined && alert.setupId !== filter.setupId) return false;
  if (filter.from && alert.triggeredAt < filter.from) return false;
  if (filter.to && alert.triggeredAt > filter.to) return false;
  return true;
}

export const mockAlerts = {
  getAlerts: async (_userId: number, filter?: AlertsFilter): Promise<Alert[]> =>
    MOCK_ALERTS.filter((a) => matchesFilter(a, filter)),

  getAlert: async (alertId: number): Promise<Alert> => {
    const alert = MOCK_ALERTS.find((a) => a.id === alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found`);
    return alert;
  },

  updateAlertStatus: async (alertId: number, status: "read" | "dismissed"): Promise<{ id: number; status: Alert["status"] }> => {
    const index = MOCK_ALERTS.findIndex((a) => a.id === alertId);
    if (index === -1) throw new Error(`Alert ${alertId} not found`);
    MOCK_ALERTS = MOCK_ALERTS.map((a) => (a.id === alertId ? { ...a, status } : a));
    return { id: alertId, status };
  },

  getThresholds: async (setupId: number): Promise<SetupThresholds> => {
    const thresholds = MOCK_THRESHOLDS[setupId];
    if (!thresholds) throw new Error(`Thresholds for setup ${setupId} not found`);
    return thresholds;
  },

  updateThresholds: async (setupId: number, updates: UpdateThresholdsRequest): Promise<SetupThresholds> => {
    const existing = MOCK_THRESHOLDS[setupId];
    if (!existing) throw new Error(`Thresholds for setup ${setupId} not found`);
    const updated: SetupThresholds = { ...existing, ...updates };
    MOCK_THRESHOLDS[setupId] = updated;
    return updated;
  },
};
