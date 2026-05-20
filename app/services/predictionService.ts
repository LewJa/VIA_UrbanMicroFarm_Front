import api from "../api/client";
import type { Prediction } from "~/model/prediction/types";
import { isMockEnabled } from "~/mocks";
import { mockPredictions } from "~/mocks/predictions";

export const predictionService = {
  getPredictions: async (plantId: number): Promise<Prediction[]> => {
    if (isMockEnabled) return mockPredictions.getPredictions(plantId);
    const response = await api.get<Prediction[]>(`/api/plants/${plantId}/predictions`);
    return response.data;
  },
};
