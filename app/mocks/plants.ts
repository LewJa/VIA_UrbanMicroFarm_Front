import type { Plant } from "~/model/plant/types";

const PLANTS: Plant[] = [
  { id: 1, name: "Tomato", description: "Cherry tomato", type: "Vegetable", datePlanted: "2026-04-10", status: "Healthy" },
  { id: 2, name: "Basil", description: "Sweet basil", type: "Herb", datePlanted: "2026-05-01", status: "Needs Water" },
];

export const mockPlants = {
  getPlantsBySetup: async (_setupId: number): Promise<Plant[]> => PLANTS,

  getPlant: async (id: number): Promise<Plant & { sensorId: number }> => {
    const p = PLANTS.find((p) => p.id === id) ?? PLANTS[0];
    return { ...p, sensorId: 100 + p.id };
  },

  getPlantForSensor: async (_sensorId: number): Promise<Plant> => PLANTS[0],

  addPlant: async (plantData: Omit<Plant, "id" | "datePlanted" | "status">): Promise<Plant> => ({
    id: PLANTS.length + 1,
    ...plantData,
    datePlanted: new Date().toISOString().split("T")[0],
    status: "Healthy",
  }),

  updatePlant: async (plantId: number, updatedData: Partial<Plant>): Promise<Plant> => {
    const plant = PLANTS.find((p) => p.id === plantId) ?? PLANTS[0];
    return { ...plant, ...updatedData };
  },

  removePlant: async (_plantId: number): Promise<{ message: string }> => ({
    message: "Plant removed successfully",
  }),
};
