export interface Plant {
  id: number;
  sensorId: number;
  name: string;
  description: string;
  type: string;
  datePlanted: string;
  status: string;
  photo?: string;
  health?: "ok" | "water" | "unknown";
}

export interface SensorHistoricalReading {
  value: number;
  timestamp: string;
}

export interface SensorReadingHistory {
  reading: SensorHistoricalReading[];
}
