import type { GrowingSetup, SetupReading, MoistureSensor, WateringEvent } from "../model/growingSetup/types";
import type { Plant } from "../model/plant/types";
import type { SensorReading, SensorHistoricalReading, SensorPlant } from "../model/sensor/types";
import type { UserProfile, UserWithName, LoginResponse } from "../model/user/types";

export const isMockEnabled = import.meta.env.VITE_USE_MOCKS === 'true';

export const MockService = {
  //Growing setups
  growingSetups: [
    { id: 1, location: "Balcony", status: "Active" }
  ] as GrowingSetup[],

  setupReadings: {
    1: { timestamp: new Date().toISOString(), temperature: 24.5, humidity: 45, light: 850 }
  } as Record<number, Omit<SetupReading, "setupId">>, 

  sensors: [
    { id: 101, status: "Active" },
    { id: 102, status: "Inactive" }
  ] as MoistureSensor[],

  async assignSetupToUser(userId: number, setupId: number): Promise<{ growingSetup: GrowingSetup }> {
    return { growingSetup: this.growingSetups.find(s => s.id === setupId) || { id: setupId, location: "Default", status: "Active" } };
  },
  async updateSetupLocation(setupId: number, location: string): Promise<{ growingSetup: GrowingSetup }> {
    const setup = this.growingSetups.find(s => s.id === setupId) || { id: setupId, location: "Default", status: "Active" };
    return { growingSetup: { ...setup, location } };
  },
  async disconnectSetupFromUser(setupId: number): Promise<{ message: string }> {
    return { message: "Setup disconnected successfully (MOCK)" };
  },
  async getSetupsByUserID(userId: number): Promise<GrowingSetup[]> {
    return this.growingSetups;
  },
  async getSetupSensorReadings(setupId: number): Promise<SetupReading> {
    const reading = this.setupReadings[setupId] || { timestamp: new Date().toISOString(), temperature: 20, humidity: 50, light: 500 };
    return { setupId, ...reading } as SetupReading; 
  },
  async fetchAllAssignedSensors(setupId: number): Promise<MoistureSensor[]> {
    return this.sensors;
  },


  //Plants
  plants: [
    { id: 1, name: "Tomato", description: "Cherry tomato", type: "Vegetable", datePlanted: "2026-04-10", status: "Healthy" },
    { id: 2, name: "Basil", description: "Sweet basil", type: "Herb", datePlanted: "2026-05-01", status: "Needs Water" }
  ] as Plant[],

  async getPlantsBySetup(setupId: number): Promise<Plant[]> {
    return this.plants;
  },
  async getPlant(id: number): Promise<any> {
    const p = this.plants.find(p => p.id === id) || this.plants[0];
    return { ...p, sensorId: 100 + p.id };
  },
  async getPlantBySensor(sensorId: number): Promise<Plant> {
    return this.plants[0];
  },
  async getPlantForSensor(sensorId: number): Promise<Plant> {
    return this.plants[0];
  },
  async addPlant(plantData: any): Promise<Plant> {
    const newPlant = { id: 3, ...plantData, datePlanted: new Date().toISOString().split('T')[0], status: "Healthy" };
    this.plants.push(newPlant);
    return newPlant;
  },
  async updatePlant(plantId: number, updatedData: any): Promise<Plant> {
    const plant = this.plants.find(p => p.id === plantId) || this.plants[0];
    return { ...plant, ...updatedData };
  },
  async removePlant(plantId: number): Promise<{ message: string }> {
    return { message: "Plant removed successfully" };
  },


  //Sensors
  async getLatestReading(sensorId: number): Promise<SensorReading> {
    return { sensorId: sensorId, value: 850.5, timestamp: new Date().toISOString() } as unknown as SensorReading;
  },
  async getReadings(sensorId: number): Promise<SensorHistoricalReading[]> {
    return [
      { value: 900.0, timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
      { value: 850.5, timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
      { value: 800.0, timestamp: new Date().toISOString() }
    ];
  },


  //Users
  mockUser: { id: 1, email: "user@example.com", theme: "system" } as UserProfile,
  
  async register(data?: any): Promise<{ message: string }> {
    return { message: "User registered successfully (MOCK)" };
  },
  async login(data?: any): Promise<LoginResponse> {
    return { token: "mock-jwt-token-12345", user: this.mockUser };
  },
  async deleteAccount(userId?: number): Promise<{ message: string }> {
    return { message: "Account deleted successfully (MOCK)" };
  },
  async updateName(userId: number, name: string): Promise<{ user: UserWithName }> {
    return { user: { id: userId, email: this.mockUser.email, name } };
  },
  async changePassword(userId?: number, data?: any): Promise<{ message: string }> {
    return { message: "Password updated successfully (MOCK)" };
  },
  async changeEmail(userId: number, email: string): Promise<{ user: Pick<UserProfile, "id" | "email"> }> {
    return { user: { id: userId, email } };
  },
  async setTheme(userId: number, theme: "light" | "dark" | "system"): Promise<{ user: UserProfile }> {
    return { user: { ...this.mockUser, theme } };
  },


  //Watering
  async triggerManualWatering(plantId: number): Promise<{ message: string }> {
    return { message: "Watering triggered successfully (MOCK)" };
  },
  async getLastWateringEvent(setupId: number): Promise<WateringEvent> {
    return { eventId: 1, startTime: new Date(Date.now() - 60000).toISOString(), endTime: new Date().toISOString(), waterUsedLiters: 0.5, mode: "Manual" };
  },
  async getHistoricalWateringEvents(setupId: number): Promise<WateringEvent[]> {
    return [
      { eventId: 2, startTime: new Date(Date.now() - 86400000).toISOString(), endTime: new Date(Date.now() - 86340000).toISOString(), waterUsedLiters: 0.5, mode: "Auto" },
      { eventId: 1, startTime: new Date(Date.now() - 60000).toISOString(), endTime: new Date().toISOString(), waterUsedLiters: 0.5, mode: "Manual" }
    ];
  }
};