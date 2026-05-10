export interface GrowingSetup {
  id: number;
  location: string;
  status: string;
}

export interface SetupReading {
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
  mode: string;
}

export interface MoistureSensor {
  id: number;
  status: string;
}