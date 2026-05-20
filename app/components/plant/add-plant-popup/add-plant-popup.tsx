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

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add plant.";
      setErrorMessage(message);
      setSubmitStatus("error");
    }
  };

  return (
    <div className={`modal-overlay${isClosing ? " is-closing" : ""}`}>
      {submitStatus === "success" && (
        <div className="bg-[#FAF8F5] rounded-3xl p-8 w-[90%] max-w-sm shadow-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 text-green-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-8 text-center text-sm">Your new plant has been successfully added to this setup.</p>
            <button
                onClick={() => {
                    onContinue({ name, type, sensorId: sensorId as number });
                    handleClose();
                }}
                className="w-full rounded-full py-2 px-6 bg-[#2B4522] text-white font-medium hover:bg-green-900 transition-colors"
            >
                Continue &rarr;
            </button>
        </div>
      )}
      {submitStatus === "error" && (
        <div className="bg-[#FAF8F5] rounded-3xl p-8 w-[90%] max-w-sm shadow-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-8 text-center text-sm">We couldn't add your plant: {errorMessage}</p>
            <button
                onClick={() => setSubmitStatus(null)}
                className="w-full rounded-full py-2 px-6 bg-[#2B4522] text-white font-medium hover:bg-green-900 transition-colors"
            >
                Try Again &rarr;
            </button>
        </div>
      )}
      {submitStatus === null && (
        <div className="modal-container">
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
        </div>
      )}
    </div>
  );
}
