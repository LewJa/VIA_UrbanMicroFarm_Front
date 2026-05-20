import { useEffect, useState } from "react";
import "~/components/growingSetup/styles/add-growingsetup.css";
import { growingSetupsService } from "~/services/growingSetupsService";
import type { MoistureSensor } from "~/model/growingSetup/types";
import {addPlant} from "~/services/plantsService";

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: { name: string; type: string; sensorId: number }) => void;
  setupId: number;
}

const PLANT_TYPES = ["Herb"];

export function AddPlantModal({
  isOpen,
  onClose,
  onContinue,
  setupId,
}: AddPlantModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [sensorId, setSensorId] = useState<number | null>(null);
  const [sensorList, setSensorList] = useState<MoistureSensor[]>([]);

  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchSensors = async () => {
      const sensors =
        await growingSetupsService.fetchAllAssignedSensors(setupId);
      setSensorList(sensors);
    };

    // TODO: change
    fetchSensors();
  }, [setupId]);

  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setName("");
      setType("");
      setSensorId(null);
      setSubmitStatus(null);
      setErrorMessage("");
      onClose();
    }, 180);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sensorId === null) return;

    try {
      await addPlant({ sensorId, name, type, description });

      setSubmitStatus("success");
      setTimeout(() => {
        onContinue({ name, type, sensorId });
        handleClose();
      }, 1500);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add plant.";
      setErrorMessage(message);
      setSubmitStatus("error");
    }
  };

  return (
    <div className={`modal-overlay${isClosing ? " is-closing" : ""}`}>
      <div className="modal-container">
        {submitStatus === "success" && (
            <p className="text-mf-ok text-sm mt-2">Plant added successfully!</p>
        )}
        {submitStatus === "error" && (
            <p className="text-mf-err text-sm mt-2">{errorMessage}</p>
        )}
        {submitStatus === null && (
            <form onSubmit={handleSubmit}>
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">Add plant</h2>
                  <button
                      type="button"
                      onClick={handleClose}
                      className="modal-close-btn"
                  >
                    ✕
                  </button>
                </div>

                <div className="input-group">
                  <label htmlFor="name" className="input-label">
                    Name
                  </label>
                  <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter plant name"
                      className="modal-input"
                      required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="plantType" className="input-label">
                    Type
                  </label>
                  <select
                      id="plantType"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="modal-input"
                      required
                  >
                    <option value="" disabled>
                      Choose plant type
                    </option>
                    {PLANT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="description" className="input-label">
                    Name
                  </label>
                  <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter your plant details and notes"
                      className="modal-input"
                      required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="sensorId" className="input-label">
                    Moisture sensor
                  </label>
                  <div className="flex flex-row">
                    {sensorList.length === 0 && (
                        <p className="text-sm text-mf-ink-3">No moisture sensors detected.</p>
                    )}
                    {sensorList.map((sensor) => (
                        <button
                            className={`p-1 rounded transition-colors ${sensorId === sensor.id ? "bg-mf-warn/60" : "bg-mf-warn/15 hover:bg-mf-warn/60"}`}
                            key={sensor.id}
                            type="button"
                            onClick={() => {
                              sensorId != sensor.id
                                  ? setSensorId(sensor.id)
                                  : setSensorId(null);
                            }}
                        >
                          #{sensor.id}
                        </button>
                    ))}

                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleClose} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-continue">
                  Continue
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
}
