export interface SetupLatestReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  light: number;
}

export interface SensorLatestReading {
  sensorId: number;
  value: number;
  timestamp: string;
}

export interface Plant {
  id: number;
  name: string;
  description: string;
  type: string;
  datePlanted: string;
  status: string;
}

export interface SensorHistoricalReading {
  value: number;
  timestamp: string;
}

export interface SensorReadingHistory {
  reading: SensorHistoricalReading[];
}
