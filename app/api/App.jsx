import { useEffect, useState } from "react";
import { getLatestSensorReading } from "../features/sensors/service/sensorsService";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getLatestSensorReading("1")
      .then(setData)
      .catch((error) => console.error("API Error:", error));
  }, []);

  return (
    <div>
      <h1>Sensor Data</h1>

      {data ? (
        <div>
          <p>Value: {data.value}</p>
          <p>Timestamp: {data.timestamp}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;