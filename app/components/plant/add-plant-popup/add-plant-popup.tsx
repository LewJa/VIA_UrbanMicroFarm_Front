import { useEffect, useState } from "react";
import "~/components/growingSetup/styles/add-growingsetup.css";
import { growingSetupsService } from "~/services/growingSetupsService";
import type { MoistureSensor } from "~/model/growingSetup/types";

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
  const [sensorId, setSensorId] = useState<number | null>(null);
  const [sensorList, setSensorList] = useState<MoistureSensor[]>([]);

  useEffect(() => {
    const fetchSensors = async () => {
      const sensors =
        await growingSetupsService.fetchAllAssignedSensors(setupId);
      setSensorList(sensors);
    };

    // TODO: change
    // fetchSensors();
    setSensorList([{ id: 1, status: "active" }]);
  }, [setupId]);

  if (!isOpen) return null;

  const handleClose = () => {
    setName("");
    setType("");
    setSensorId(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sensorId === null) return;

    // TODO: implement SENSOR SERVICE - add plant to sensor

    onContinue({ name, type, sensorId });
    handleClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add plant</h2>
              <button
                type="button"
                onClick={onClose}
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
              <label htmlFor="sensorId" className="input-label">
                Moisture sensor
              </label>
              <div className="flex flex-row">
                {sensorList.map((sensor) => (
                  <button
                    className={`p-1 ${sensorId === sensor.id ? "bg-amber-400" : "bg-amber-100 hover:bg-amber-400"}`}
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
    </div>
  );
}
