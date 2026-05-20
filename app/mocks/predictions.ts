import type { Prediction } from "~/model/prediction/types";

const day = 24 * 60 * 60 * 1000;

function generatePredictions(plantName: string, days: number): Prediction[] {
  const predictions: Prediction[] = [];
  const now = Date.now();
  let base = 0.8;
  for (let i = days; i >= 0; i--) {
    base = Math.min(2.0, Math.max(0.2, base + (Math.random() - 0.45) * 0.15));
    predictions.push({
      predictionId: days - i + 1,
      predictedValue: Math.round(base * 100) / 100,
      createdAt: new Date(now - i * day).toISOString(),
      plantName,
    });
  }
  return predictions;
}

export const MOCK_PREDICTIONS = generatePredictions("Tomato", 60);

export const mockPredictions = {
  getPredictions: async (_plantId: number): Promise<Prediction[]> => MOCK_PREDICTIONS,
};
