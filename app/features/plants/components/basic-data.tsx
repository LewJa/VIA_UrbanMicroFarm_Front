import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router";
import { getLatestSensorReading } from "../../sensors/service/sensorsService";
import type { SensorReading } from "../../sensors/types";
import type { PlantContext } from "./plant-layout";
import "./basic-data.css";

export default function BasicData() {
  const { setupId } = useParams();
  const { plant } = useOutletContext<PlantContext>();
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!setupId) return;

    const setupIdNumber = parseInt(setupId);

    setLoading(true);
    getLatestSensorReading(setupIdNumber, "TEMPERATURE")
      .then((data) => {
        setReading(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch sensor reading:", err);
        setError("Failed to load latest sensor data.");
        setLoading(false);
      });
  }, [setupId]);

  if (loading)
    return <div className="basic-data-container">Loading sensor data...</div>;
  if (error) return <div className="basic-data-error">{error}</div>;

  return (
    <div className="basic-data-container">
      <h2 className="basic-data-title">
        {plant ? `${plant.name} — Latest Readings` : "Latest Sensor Readings"}
      </h2>
      {reading ? (
        <div className="sensor-reading-card">
          <p>
            <strong>Sensor ID:</strong> {reading.sensorId}
          </p>
          <p>
            <strong>Value:</strong> {reading.value}
          </p>
          <p>
            <strong>Timestamp:</strong>{" "}
            {new Date(reading.timestamp).toLocaleString()}
          </p>
        </div>
      ) : (
        <p>No sensor data available for this plant.</p>
      )}
    </div>
  );
}
