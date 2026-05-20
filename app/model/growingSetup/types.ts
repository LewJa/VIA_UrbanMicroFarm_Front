export interface GrowingSetup {
  id: number;
  location: string;
  status: string;
  createdAt: string;
}

export interface SetupReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  light: number;
}

export interface MoistureSensor {
  id: number;
  status: string;
}