export interface Plant {
  id: number;
  sensorId: number;
  name: string;
  type: string;
  description?: string;
  datePlanted: string;
  status: string;
}