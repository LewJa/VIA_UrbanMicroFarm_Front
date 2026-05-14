export interface SensorReading {
  sensorId: string;
  value: number;
  timestamp: string;
}

export interface SensorHistoricalReading {
  value: number;
  timestamp: string;
}

export interface SensorReadingsParams {
  plantId?: number;
  from?: string;
  to?: string;
}

export interface SensorPlant {
  id: number;
  sensorId: number;
  name: string;
  description: string;
  datePlanted: string;
  status: string;
}
