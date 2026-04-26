import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getLatestSensorReading } from "../../sensors/service/sensorsService";
import type { SensorReading } from "../../sensors/types";
import "./basic-data.css";

export default function BasicData() {
  const { plantId } = useParams();
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plantId) return;

    setLoading(true);
    // Assuming the sensorId maps to the plantId for now.
    getLatestSensorReading(plantId)
      .then((data) => {
        setReading(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch sensor reading:", err);
        setError("Failed to load latest sensor data.");
        setLoading(false);
      });
  }, [plantId]);

  if (loading) return <div className="basic-data-container">Loading sensor data...</div>;
  if (error) return <div className="basic-data-error">{error}</div>;

  return (
    <div className="basic-data-container">
      <h2 className="basic-data-title">Latest Sensor Readings</h2>
      {reading ? (
        <div className="sensor-reading-card">
          <p><strong>Sensor ID:</strong> {reading.sensorId}</p>
          <p><strong>Value:</strong> {reading.value}</p>
          <p><strong>Timestamp:</strong> {new Date(reading.timestamp).toLocaleString()}</p>
        </div>
      ) : (
        <p>No sensor data available for this plant.</p>
      )}
    </div>
  );
}

