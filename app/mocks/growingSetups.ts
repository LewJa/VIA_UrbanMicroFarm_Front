import type {GrowingSetup, SetupReading, MoistureSensor, Sensor} from "~/model/growingSetup/types";

const GROWING_SETUPS: GrowingSetup[] = [
  { id: 1, location: "Balcony", status: "Active" },
];

const SETUP_READINGS: Record<number, Omit<SetupReading, "setupId">> = {
  1: { timestamp: new Date().toISOString(), temperature: 24.5, humidity: 45, light: 850 },
};

const SENSORS: Sensor[] = [
  { id: 101, type: "SOIL_MOISTURE", status: "Active" },
  { id: 102, type: "TEMPERATURE", status: "Inactive" },
];

export const mockGrowingSetups = {
  assignSetupToUser: async (_userId: number, setupId: number): Promise<{ growingSetup: GrowingSetup }> => ({
    growingSetup: GROWING_SETUPS.find((s) => s.id === setupId) ?? { id: setupId, location: "Default", status: "Active" },
  }),

  updateSetupLocation: async (setupId: number, location: string): Promise<{ growingSetup: GrowingSetup }> => {
    const setup = GROWING_SETUPS.find((s) => s.id === setupId) ?? { id: setupId, location: "Default", status: "Active" };
    return { growingSetup: { ...setup, location } };
  },

  disconnectSetupFromUser: async (_setupId: number): Promise<{ message: string }> => ({
    message: "Setup disconnected successfully (MOCK)",
  }),

  getSetupsByUserID: async (_userId: number): Promise<GrowingSetup[]> => GROWING_SETUPS,

  getSetupSensorReadings: async (setupId: number): Promise<SetupReading> => {
    const reading = SETUP_READINGS[setupId] ?? { timestamp: new Date().toISOString(), temperature: 20, humidity: 50, light: 500 };
    return { setupId, ...reading } as SetupReading;
  },

  fetchAllAssignedSensors: async (_setupId: number): Promise<Sensor[]> => SENSORS,
};
