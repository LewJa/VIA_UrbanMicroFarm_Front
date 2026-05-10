import { useEffect, useState } from "react";
import "./add-growingsetup.css";
import type { EntryIssuesMap } from "next/dist/shared/lib/turbopack/utils";
import { growingSetupsService } from "~/features/growingSetups/service/growingSetupsService";
import valueProcessor from "next/dist/build/webpack/loaders/resolve-url-loader/lib/value-processor";
import type { MoistureSensor } from "~/features/growingSetups/types";

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
  const [sensorId, setSensorId] = useState<number>([]);
  const [sensorList, setSensorList] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue({ name, type, sensorId });
  };

  useEffect(() => {
    const setupSensors: MoistureSensor[] =
      growingSetupsService.fetchAllAssignedSensors(setupId);
    setSensorId(setupSensors.id);
  });

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

            {/* <p className="modal-description">
            </p> */}

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
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-continue">
              Continue &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
