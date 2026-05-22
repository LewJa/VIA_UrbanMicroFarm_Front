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
  mode: string;
  timestamp: string;
}

export interface SensorReadingHistory {
  reading: SensorHistoricalReading[];
}
