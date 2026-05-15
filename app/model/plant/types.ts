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
