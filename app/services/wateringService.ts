import api from "../api/client";
import type {WateringEvent} from "../model/growingSetup/types";
import {isMockEnabled} from "~/mocks";
import {MOCK_WATERING_EVENTS, mockWatering} from "~/mocks/wateringEvents";

// Pending IoT: real endpoint not yet available. Keep false until backend ships.
const isWateringEventsEnabled = () =>
    import.meta.env.VITE_WATERING_EVENTS_ENABLED === "true";

export const wateringService = {
    triggerManualWatering: async (plantId: number): Promise<{ message: string }> => {
        if (isMockEnabled) return mockWatering.triggerManualWatering(plantId);
        const response = await api.post<{ message: string }>(`/api/plants/${plantId}/watering/manual`);
        return response.data;
    },

    getLastWateringEvent: async (setupId: number): Promise<WateringEvent> => {
        if (isMockEnabled) return mockWatering.getLastWateringEvent(setupId);
        const response = await api.get<WateringEvent>(`/api/growingsetups/${setupId}/wateringEvents/latest`);
        return response.data;
    },

    getHistoricalWateringEvents: async (setupId: number, from?: string, to?: string): Promise<WateringEvent[]> => {
        if (!isWateringEventsEnabled()) {
            const fromMs = from ? Date.parse(from) : 0;
            const toMs = to ? Date.parse(to) : Infinity;
            return MOCK_WATERING_EVENTS.filter((e) => {
                const t = Date.parse(e.createdAt);
                return t >= fromMs && t <= toMs;
            });
        }
        if (isMockEnabled) return mockWatering.getHistoricalWateringEvents(setupId);
        const response = await api.get<WateringEvent[]>(
            `/api/growingsetups/${setupId}/wateringEvents`,
            { params: { from, to } },
        );
        return response.data;
    },
};
