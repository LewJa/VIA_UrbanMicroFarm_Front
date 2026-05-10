import { Outlet, NavLink } from "react-router";
import { useState } from "react";
import { wateringService } from "../../watering/service/wateringService";
// Import the image directly so the bundler handles it
import plantImg from "../../../assets/plant.png";
import "./plant-layout.css";

interface PlantLayoutProps {
  plantId: string;
}

export function PlantLayout({ plantId }: PlantLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);

  const handleManualWatering = async () => {
    try {
      await wateringService.triggerManualWatering(Number(plantId));
      alert("Manual watering triggered successfully!");
      setIsConfirmPopupOpen(false);
    } catch (error) {
      console.error("Failed to trigger manual watering", error);
      alert("Failed to trigger manual watering.");
    }
  };

  const tabs = [
    { name: 'Basic data', path: 'basic-data' },
    { name: 'Predictions', path: 'predictions' },
    { name: 'Historical data', path: 'historical-data' }
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-header-bar">
          <h1 className="dashboard-title">Plant {plantId}</h1>
          
          <div className="menu-container">
            <button 
              className="menu-button" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ⋮
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    setIsConfirmPopupOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Water manually
                </button>
              </div>
            )}
          </div>
        </div>

        {isConfirmPopupOpen && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>Confirm Watering</h2>
              <p>Are you sure you want to trigger manual watering?</p>
              <div className="popup-actions">
                <button 
                  className="popup-button cancel" 
                  onClick={() => setIsConfirmPopupOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="popup-button confirm" 
                  onClick={handleManualWatering}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="dashboard-content">
          <div className="plant-container">{/* Left Column */}
            <span className="placeholder-icon">
              <img src={plantImg} alt="Plant" width={300} height={200} />
            </span>
            <p id="plant-species">Plant species</p>
          </div>
          <div className="data-container">  {/* Right Column */}
            <div className="tabs-header">  {/* Tab Navigation */}
              {tabs.map((tab) => (
                <NavLink
                  key={tab.name}
                  to={tab.path}
                  end={tab.path === '.' || tab.path === ''}
                  className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
                >
                  {tab.name}
                </NavLink>
              ))}
            </div>

            <div className="tab-content-area">
                <div className="outlet-container"><Outlet /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
