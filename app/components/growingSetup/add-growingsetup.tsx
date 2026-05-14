import { useState } from "react";
import "./styles/add-growingsetup.css";

interface AddGrowingSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: { serialNumber: string; locationName: string }) => void;
}

export function AddGrowingSetupModal({ isOpen, onClose, onContinue }: AddGrowingSetupModalProps) {
  const [serialNumber, setSerialNumber] = useState("");
  const [locationName, setLocationName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue({ serialNumber, locationName });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            
            <div className="modal-header">
              <h2 className="modal-title">
                Add growing setup
              </h2>
              <button type="button" onClick={onClose} className="modal-close-btn">
                ✕
              </button>
            </div>
            
            <p className="modal-description">
              Find the number printed on your growing setup.
            </p>

            <div className="input-group">
              <label htmlFor="serialNumber" className="input-label">Serial number</label>
              <input 
                id="serialNumber"
                type="text" 
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Enter serial number"
                className="modal-input"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="locationName" className="input-label">Growing setup location</label>
              <input 
                id="locationName"
                type="text" 
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Enter location name (e.g. Kitchen)"
                className="modal-input"
                required
              />
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
