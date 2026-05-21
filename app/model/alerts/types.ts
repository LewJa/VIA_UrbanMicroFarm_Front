// UNSTABLE CONTRACT — backend endpoints not yet confirmed.
// All shapes below reflect the proposed API contract as of 2026-05-22.
// Update this file when the backend team confirms or revises the contract.

export type AlertType =
  | "MOISTURE_LOW"
  | "WATER_THRESHOLD_EXCEEDED"
  | "SENSOR_MALFUNCTION";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertStatus = "unread" | "read" | "dismissed";

export interface Alert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  setupId: number;
  plantId: number | null;
  sensorId: number | null;
  status: AlertStatus;
  triggeredAt: string; // ISO 8601
}

export interface AlertsFilter {
  status?: AlertStatus;
  from?: string;    // ISO 8601
  to?: string;      // ISO 8601
  setupId?: number;
}

export interface UpdateAlertStatusRequest {
  status: "read" | "dismissed";
}

export interface UpdateAlertStatusResponse {
  id: number;
  status: AlertStatus;
}

// Thresholds — 0-1023 ADC for moisture (raw sensor value).
// Convert to % only in the UI layer: Math.round(value / 10.23).
export interface SetupThresholds {
  setupId: number;
  moistureMin: number;                // 0-1023 ADC
  waterConsumptionMaxLiters: number;
  baselineWaterLiters: number;        // system-calculated, read-only
}

export interface UpdateThresholdsRequest {
  moistureMin?: number;
  waterConsumptionMaxLiters?: number;
}
