export interface GrowingSetup {
  id: number;
  location: string;
  status: string;
  sensorSlots?: number;
}

export interface SetupReading {
  setupId: number;
  timestamp: string;
  temperature: number;
  humidity: number;
  light: number;
}

export interface WateringEvent {
  eventId: number;
  startTime: string;
  endTime: string;
  waterUsedLiters: number;
  mode: "manual" | "automatic";
}

export interface MoistureSensor {
  id: number;
  status: string;
}

export interface Sensor {
  id: number;
  type: string;
  status: string;
}