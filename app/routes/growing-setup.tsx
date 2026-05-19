import { useParams, useLocation, Link } from "react-router";
import { useState, useEffect } from "react";
import { growingSetupsService } from "~/services/growingSetupsService";
import { getPlantsBySetup } from "~/services/plantsService";
import { AddPlantModal } from "~/components/plant/add-plant-popup/add-plant-popup";
import type { GrowingSetup, SetupReading, MoistureSensor } from "~/model/growingSetup/types";
import type { Plant } from "~/model/plant/types";

// TODO: replace with userId from auth context once authentication is fully implemented
const HARDCODED_USER_ID = 1;

type PageStatus = "loading" | "error" | "success";

interface AxiosLikeError {
  response?: {
    status?: number;
    data?: { error?: { code?: string; message?: string; timestamp?: string } };
  };
}

export default function GrowingSetupPage() {
  const { setupId } = useParams<{ setupId: string }>();
  const location = useLocation();

  const id = Number(setupId);
  const navState = location.state as { location?: string; status?: string } | null;
  const navLocation = navState?.location;
  const navStatus = navState?.status;

  const [setup, setSetup] = useState<GrowingSetup | null>(null);
  const [reading, setReading] = useState<SetupReading | null>(null);
  const [sensors, setSensors] = useState<MoistureSensor[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let alive = true;
    setPageStatus("loading");
    setErrorMessage("");

    // Use navigation state for setup metadata (happy path: card click).
    // Fall back to list-and-find if the user arrived via direct URL or refresh.
    // TODO: remove fallback once backend exposes GET /api/growingsetups/{setupId}
    const setupFetch: Promise<GrowingSetup> = navLocation
      ? Promise.resolve({ id, location: navLocation, status: navStatus ?? "" })
      : growingSetupsService
          .getSetupById(id, HARDCODED_USER_ID)
          .then((s) => s ?? { id, location: `Setup #${id}`, status: "" });

    Promise.all([
      growingSetupsService.getSetupSensorReadings(id),
      growingSetupsService.fetchAllAssignedSensors(id),
      getPlantsBySetup(id),
      setupFetch,
    ])
      .then(([readingData, sensorData, plantData, setupData]) => {
        if (!alive) return;
        setReading(readingData);
        setSensors(sensorData);
        setPlants(plantData);
        setSetup(setupData);
        setPageStatus("success");
      })
      .catch((err: unknown) => {
        if (!alive) return;
        const axiosErr = err as AxiosLikeError;
        const httpStatus = axiosErr?.response?.status;
        if (httpStatus === 401 || httpStatus === 403) {
          setErrorMessage("You don't have permission to view this growing setup.");
        } else {
          setErrorMessage(
            axiosErr?.response?.data?.error?.message ?? "Failed to load setup data.",
          );
        }
        setPageStatus("error");
      });

    return () => {
      alive = false;
    };
  }, [id, retryCount, navLocation, navStatus]);

  const handlePlantAdded = () => {
    getPlantsBySetup(id).then(setPlants).catch(() => {});
  };

  if (pageStatus === "loading") {
    return (
      <div
        className="flex items-center justify-center min-h-64"
        aria-busy="true"
        aria-label="Loading growing setup"
      >
        <p className="text-mf-ink-3">Loading…</p>
      </div>
    );
  }

  if (pageStatus === "error") {
    return (
      <div
        role="alert"
        className="m-6 p-6 rounded-mf-lg border-2 border-dashed border-mf-err/30 bg-mf-err/8"
      >
        <h2 className="font-bold text-mf-err">Error</h2>
        <p className="text-sm mt-1 text-mf-ink-2">{errorMessage}</p>
        <button
          className="mf-btn mf-btn-sm mt-3 bg-mf-err text-[#F4EEDB] hover:brightness-[0.85]"
          onClick={() => setRetryCount((c) => c + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 sm:mx-6 xl:mx-12 mt-6 mb-10 space-y-6 max-w-screen-xl">
      <div>
        <h1 className="text-3xl font-bold text-mf-forest">{setup?.location ?? `Setup #${id}`}</h1>
        {setup?.status && <p className="text-sm text-mf-ink-3 mt-1">Status: {setup.status}</p>}
      </div>

      {/* Environmental readings */}
      <section aria-label="Environmental readings" className="mf-card p-4 sm:p-6">
        <h2 className="font-semibold text-lg mb-4 text-mf-ink">Latest Readings</h2>
        {reading ? (
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <dt className="text-xs uppercase tracking-wide text-mf-ink-4">Temperature</dt>
              <dd className="text-2xl font-semibold text-mf-ink mt-1">{reading.temperature} °C</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs uppercase tracking-wide text-mf-ink-4">Humidity</dt>
              <dd className="text-2xl font-semibold text-mf-ink mt-1">{reading.humidity} %</dd>
            </div>
            <div className="flex flex-col">
              {/* TODO: confirm whether to surface as lux once IoT publishes a conversion */}
              <dt className="text-xs uppercase tracking-wide text-mf-ink-4">Light (ADC)</dt>
              <dd className="text-2xl font-semibold text-mf-ink mt-1">{reading.light} / 1023</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs uppercase tracking-wide text-mf-ink-4">Last Updated</dt>
              <dd className="text-sm text-mf-ink-2 mt-1">
                {new Date(reading.timestamp).toLocaleString()}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-mf-ink-4">No readings available.</p>
        )}
      </section>

      {/* Sensors */}
      <section aria-label="Sensors" className="mf-card p-4 sm:p-6">
        <h2 className="font-semibold text-lg mb-4 text-mf-ink">Sensors</h2>
        {sensors.length === 0 ? (
          <p className="text-sm text-mf-ink-4">No sensors assigned.</p>
        ) : (
          <ul className="space-y-2">
            {sensors.map((sensor) => (
              <li key={sensor.id} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-mf-ink-2">#{sensor.id}</span>
                <span
                  className={`mf-chip ${
                    sensor.status === "Active" ? "mf-chip-ok" : ""
                  }`}
                >
                  {sensor.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Plants */}
      <section aria-label="Plants" className="mf-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-mf-ink">Plants</h2>
          <button
            className="mf-btn mf-btn-primary mf-btn-sm"
            onClick={() => setIsModalOpen(true)}
          >
            Add Plant
          </button>
        </div>
        {plants.length === 0 ? (
          <p className="text-sm text-mf-ink-4">No plants yet. Add one to get started.</p>
        ) : (
          <ul className="space-y-2">
            {plants.map((plant) => (
              <li key={plant.id}>
                {/* TODO: simplify to /plants/:plantId once nested URL hierarchy is revisited */}
                <Link
                  to={`/setup/${id}/sensor/${plant.sensorId}/plant/${plant.id}`}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-mf-md border border-mf-line hover:border-mf-forest/30 hover:bg-mf-forest/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-mf-ink">{plant.name}</p>
                    <p className="text-xs text-mf-ink-3 mt-0.5">
                      {plant.type} · Planted {plant.datePlanted}
                    </p>
                  </div>
                  <span
                    className={`mf-chip mt-2 sm:mt-0 self-start sm:self-auto ${
                      plant.status === "Healthy" ? "mf-chip-ok" : "mf-chip-warn"
                    }`}
                  >
                    {plant.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddPlantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={() => {
          setIsModalOpen(false);
          handlePlantAdded();
        }}
        setupId={id}
      />
    </div>
  );
}
