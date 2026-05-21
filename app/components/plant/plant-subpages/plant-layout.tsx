import { Outlet, NavLink, useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { wateringService } from "../../../services/wateringService";
import { getPlant } from "../../../services/plantsService";
import type { Plant } from "../../../model/plant/types";
import plantImg from "../../../assets/plant.png";
import "./plant-layout.css";

export interface PlantContext {
  plant: Plant | null;
  plantLoading: boolean;
  plantError: string | null;
}

interface PlantLayoutProps {
  plantId: string;
}

export function PlantLayout({ plantId }: PlantLayoutProps) {
  const { setupId } = useParams<{ setupId: string }>();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [plantLoading, setPlantLoading] = useState(true);
  const [plantError, setPlantError] = useState<string | null>(null);

  useEffect(() => {
    setPlantLoading(true);
    setPlantError(null);
    getPlant(Number(plantId))
      .then((data) => {
        setPlant(data);
        setPlantLoading(false);
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setPlantError(
          axiosErr?.response?.data?.error?.message ?? "Failed to load plant data.",
        );
        setPlantLoading(false);
      });
  }, [plantId]);

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
    { name: "Basic data", path: "basic-data" },
    { name: "Predictions", path: "predictions" },
    { name: "Historical data", path: "historical-data" },
  ];

  const plantContext: PlantContext = { plant, plantLoading, plantError };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <button
          onClick={() => navigate(`/setup/${setupId}`)}
          className="flex items-center gap-1.5 mb-5 text-[13px] font-medium text-mf-ink-3 hover:text-mf-ink transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to setup
        </button>

        <div className="dashboard-header-bar">
          <h1 className="dashboard-title">
            {plant ? plant.name : `Plant ${plantId}`}
          </h1>

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
          <div className="plant-container">
            <span className="placeholder-icon">
              <img src={plantImg} alt="Plant" className="w-full max-w-[300px] h-auto" />
            </span>
            <p id="plant-species">{plant?.type ?? "Plant species"}</p>
          </div>
          <div className="data-container">
            <div className="flex gap-1 p-1 bg-mf-cream rounded-full mb-1 overflow-x-auto">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.name}
                  to={tab.path}
                  end={tab.path === "." || tab.path === ""}
                  viewTransition
                  preventScrollReset
                  className={({ isActive }) =>
                    `flex flex-shrink-0 flex-1 h-9 items-center justify-center rounded-full text-[12px] sm:text-[13px] font-medium no-underline border-0 transition-all duration-150 px-2 sm:px-3 whitespace-nowrap min-w-0 ${
                      isActive
                        ? "bg-mf-card text-mf-ink shadow-mf-1"
                        : "bg-transparent text-mf-ink-2 hover:bg-mf-card/60"
                    }`
                  }
                >
                  {tab.name}
                </NavLink>
              ))}
            </div>

            <div className="tab-content-area">
              <div className="outlet-container">
                <Outlet context={plantContext} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
