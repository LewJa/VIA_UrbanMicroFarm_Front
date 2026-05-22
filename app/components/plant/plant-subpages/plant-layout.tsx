import { Outlet, NavLink, useNavigate, useParams } from "react-router";
import { useState, useEffect, useRef } from "react";
import { wateringService } from "../../../services/wateringService";
import { getPlant, updatePlantPhoto } from "../../../services/plantsService";
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
  const [isWatering, setIsWatering] = useState(false);
  const [wateringMessage, setWateringMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [plantLoading, setPlantLoading] = useState(true);
  const [plantError, setPlantError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

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
    setIsConfirmPopupOpen(false);
    setIsWatering(true);
    setWateringMessage(null);
    try {
      await wateringService.triggerManualWatering(Number(plantId));
      setWateringMessage({ text: "Watering triggered successfully!", ok: true });
      setTimeout(() => setWateringMessage(null), 3000);
    } catch {
      setWateringMessage({ text: "Failed to trigger manual watering.", ok: false });
      setTimeout(() => setWateringMessage(null), 3000);
    } finally {
      setIsWatering(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64 = evt.target?.result as string;
      try {
        const updated = await updatePlantPhoto(Number(plantId), base64);
        setPlant((prev) => prev ? { ...prev, photo: updated.photo } : prev);
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { name: "Basic data", path: "basic-data" },
    { name: "Predictions", path: "predictions" },
    { name: "Historical data", path: "historical-data" },
  ];

  const plantContext: PlantContext = { plant, plantLoading, plantError };

  return (
    <>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-mf-card border border-mf-line rounded-[20px] p-7 w-[90%] max-w-sm text-center shadow-mf-3">
              <h2 className="font-serif text-[22px] text-mf-ink mb-2">Confirm watering</h2>
              <p className="text-[14px] text-mf-ink-2 mb-6">Are you sure you want to trigger manual watering for this plant?</p>
              <div className="flex gap-3 justify-center">
                <button
                  className="mf-btn mf-btn-secondary"
                  onClick={() => setIsConfirmPopupOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="mf-btn mf-btn-primary disabled:opacity-50"
                  onClick={handleManualWatering}
                  disabled={isWatering}
                >
                  {isWatering ? "Watering…" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-content">
          <div className="plant-container">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />
            <button
              type="button"
              className="relative group w-full max-w-[260px] aspect-square rounded-2xl overflow-hidden focus:outline-none"
              onClick={() => photoInputRef.current?.click()}
              title="Upload plant photo"
            >
              {plant?.photo ? (
                <>
                  <img src={plant.photo} alt={plant.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                </>
              ) : (
                <>
                  <img src={plantImg} alt="Plant" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-4">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold uppercase tracking-wide text-mf-ink bg-mf-card/80 px-3 py-1 rounded-full">
                      Upload photo
                    </span>
                  </div>
                </>
              )}
            </button>
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

    {wateringMessage && (
      <div className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-medium shadow-mf-2 z-50 ${wateringMessage.ok ? "bg-mf-forest text-[#F4EEDB]" : "bg-mf-err text-[#F4EEDB]"}`}>
        {wateringMessage.text}
      </div>
    )}
    </>
  );
}
