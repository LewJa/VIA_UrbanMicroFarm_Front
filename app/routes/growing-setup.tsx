import React, { useEffect, useState } from "react";

import { AddPlantModal } from "../components/plant/add-plant-popup/add-plant-popup";

import { growingSetupsService } from "../services/growingSetupsService";

import type { SetupLatestReading } from "../model/plant/types";

import type { MoistureSensor } from "../model/growingSetup/types";

export default function GrowingSetupPage() {

  const [reading, setReading] =
    useState<SetupLatestReading | null>(null);

  const [sensors, setSensors] =
    useState<MoistureSensor[]>([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchData = async () => {

      try {

        // MOCK DATA

        const mockReading: SetupLatestReading = {
          timestamp: "2025-01-01T00:00:00Z",
          temperature: 22,
          humidity: 64,
          light: 68,
        };

        const mockSensors: MoistureSensor[] = [
          {
            id: 1,
            status: "ACTIVE",
          },
          {
            id: 2,
            status: "ACTIVE",
          },
        ];

        setReading(mockReading);

        setSensors(mockSensors);

        // REAL API LATER

        // const readingData =
        //   await growingSetupsService
        //     .getSetupSensorReadings(1);

        // const sensorData =
        //   await growingSetupsService
        //     .fetchAllAssignedSensors(1);

        // setReading(readingData);

        // setSensors(sensorData);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    };

    fetchData();

  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>

      <h1>Growing Setup</h1>

      {reading && (
        <>

          <p>
            Temperature: {reading.temperature}°
          </p>

          <p>
            Humidity: {reading.humidity}%
          </p>

          <p>
            Light: {reading.light}%
          </p>

          <p>
            Last Updated: {reading.timestamp}
          </p>

        </>
      )}

      <h2>Sensors</h2>

      {sensors.length === 0 ? (

        <p>No sensors assigned.</p>

      ) : (

        sensors.map((sensor) => (
          <div key={sensor.id}>
            Sensor #{sensor.id} - {sensor.status}
          </div>
        ))

      )}

      <button onClick={() => setIsModalOpen(true)}>
        Add Plant
      </button>

      <AddPlantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={(data) => {

          console.log(data);

          setIsModalOpen(false);

        }}
        setupId={1}
      />

    </div>
  );
}