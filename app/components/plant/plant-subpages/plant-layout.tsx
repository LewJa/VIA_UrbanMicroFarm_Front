import { Outlet, NavLink, useNavigate, useParams } from "react-router";
import { useState, useEffect, useRef } from "react";
import { wateringService } from "../../../services/wateringService";
import { getPlant, updatePlantPhoto } from "../../../services/plantsService";
import type { Plant } from "~/model/plant/types";
import plantImg from "../../../assets/plant.png";
import {ArrowLeftIcon} from "~/components/icons/icons-specific/ArrowLeftIcon";
import {Camera} from "~/components/icons/icons-specific/Camera";
import {DropIcon} from "~/components/icons/icons-specific/Drop";
import {MoreDotsIcon} from "~/components/icons/icons-specific/MoreDots";

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
  const [lastWatering, setLastWatering] = useState<string | null>(null);
  const [plantLoading, setPlantLoading] = useState(true);
  const [plantError, setPlantError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setPlantLoading(true);
    setPlantError(null);

    const load = async () => {
      try {
        const data = await getPlant(Number(plantId));
        setPlant(data);
        const last = await wateringService.getLastWateringEvent(data.id);
        setLastWatering(last.createdAt);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setPlantError(axiosErr?.response?.data?.error?.message ?? "Failed to load plant data.");
      } finally {
        setPlantLoading(false);
      }

    };

    load();

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

  const splitTitle = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return { head: "", tail: parts[0] };
    return { head: parts.slice(0, -1).join(" "), tail: parts[parts.length - 1] };
  }

  const daysSincePlanted = (datePlanted: string): number => {
    const diff = Date.now() - new Date(datePlanted).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const formatLastWatered = (iso: string | null): string => {
    if (!iso) return "Never watered";
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 1) return "Watered just now";
    if (minutes < 60) return `Last watered ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Last watered ${hours}h ${minutes % 60}m ago`;
    const days = Math.floor(hours / 24);
    return `Last watered ${days}d ${hours % 24}h ago`;
  };

  const tabs = [
    { name: "Basic data", path: "basic-data" },
    { name: "Predictions", path: "predictions" },
    { name: "Historical data", path: "historical-data" },
  ];

  const plantContext: PlantContext = { plant, plantLoading, plantError };
  const title = splitTitle(plant?.name ?? `Plant ${plantId}`);
  const currentStatus = plant?.health ?? "unknown";

  return (
    <>
    <div className="min-h-screen bg-mf-bg text-mf-ink">
      <div className="mx-auto max-w-3xl px-6 pb-24">
        <button
          onClick={() => navigate(`/setup/${setupId}`)}
          className="flex items-center gap-1.5 mb-5 text-[13px] font-medium text-mf-ink-3 hover:text-mf-ink transition-colors"
        >
          <ArrowLeftIcon/>
          Back to setup
        </button>

        <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
        />

        <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="group relative block w-full aspect-[16/10] sm:aspect-[16/9]
                     rounded-mf-xl overflow-hidden bg-mf-card/80
                     border border-mf-line focus:outline-none focus:ring-[3px] focus:ring-mf-forest/15"
            title="Upload plant photo"
        >
          {plant?.photo ? (
              <img
                  src={plant.photo}
                  alt={plant.name}
                  className="absolute inset-0 w-full h-full object-cover"
              />
          ) : plantImg ? (
              <img
                  src={plantImg}
                  alt="Plant"
                  className="absolute inset-0 w-full h-full object-contain p-10 opacity-90"
              />
          ) : (
              <span className="opacity-70">drop a photo</span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-mf-ink/0 group-hover:bg-mf-ink/30 transition-colors flex items-center justify-center">
            <span
                className="flex items-center gap-2 px-4 h-9 rounded-full
                         bg-mf-cream text-mf-ink text-[12px] font-medium
                         opacity-0 group-hover:opacity-100 transition-opacity shadow-mf-2"
            >
              <Camera />
              {plant?.photo ? "Change photo" : "Upload photo"}
            </span>
          </div>
        </button>

        <header className="mt-6 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="mf-small-text">
              {plant?.type ?? "Plant species"}
              {plant?.datePlanted != null && <> · Day {daysSincePlanted(plant.datePlanted) + 1}</>}
            </p>
            <h1 className="mf-h1 text-4xl sm:text-5xl mt-1.5 leading-[1.05]">
              {title.head && <>{title.head} </>}
              <em className="not-italic text-mf-forest" style={{ fontStyle: "italic" }}>
                {title.tail}
              </em>
            </h1>

            <div className="flex flex-wrap gap-2 mt-4">
              {plantLoading ? (
                  <span className="mf-chip">
                  <span className="mf-chip-dot opacity-50" />
                  loading…
                </span>
              ) : plantError ? (
                  <span className="mf-chip mf-chip-err">
                  <span className="mf-chip-dot" />
                  error
                </span>
              ) : (
                  <>
                    {currentStatus === "stressed" ? (
                        <div className="mf-chip mf-chip-warn px-2.5 py-1.5 h-auto">
                          <div className="mf-chip-dot"></div>
                          <span className="text-[12px] font-bold tracking-wide pl-1">needs water</span>
                        </div>
                    ) : currentStatus === "unknown" ? (
                        <div className="mf-chip px-2.5 py-1.5 h-auto bg-mf-line/30 text-mf-ink-4">
                          <span className="text-[12px] font-bold tracking-wide">no data</span>
                        </div>
                    ) : (
                        <div className="mf-chip mf-chip-ok px-2.5 py-1.5 h-auto">
                          <div className="mf-chip-dot"></div>
                          <span className="text-[12px] font-bold tracking-wide pl-1">ok</span>
                        </div>
                    )}
                    <span className="mf-chip">
                        <DropIcon />
                        {formatLastWatered(lastWatering)}
                    </span>
                  </>
              )}
            </div>
          </div>

          {/* Kebab menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsMenuOpen((v) => !v)}
                className="h-10 w-10 rounded-full bg-mf-card border border-mf-line
                         text-mf-ink-2 flex items-center justify-center
                         hover:bg-mf-cream transition-colors"
                aria-label="More options"
                aria-expanded={isMenuOpen}
            >
              <MoreDotsIcon />
            </button>

            {isMenuOpen && (
                <div
                    className="absolute right-0 top-12 z-30 min-w-[180px]
                           mf-card shadow-mf-3 py-1
                           animate-[fadeIn_.12s_ease-out]"
                    role="menu"
                >
                  <button
                      className="w-full text-left px-4 py-2.5 text-sm text-mf-ink
                             hover:bg-mf-cream transition-colors flex items-center gap-2"
                      onClick={() => {
                        setIsConfirmPopupOpen(true);
                        setIsMenuOpen(false);
                      }}
                      role="menuitem"
                  >
                    <span className="text-mf-water"><DropIcon /></span>
                    Water manually
                  </button>
                </div>
            )}
          </div>
        </header>

        <div className="mt-8 mf-tabs">
          {tabs.map((tab) => (
              <NavLink
                  key={tab.name}
                  to={tab.path}
                  end={tab.path === "." || tab.path === ""}
                  viewTransition
                  preventScrollReset
                  className={({ isActive }) =>
                      [
                        "flex-1 h-9 inline-flex items-center justify-center",
                        "rounded-full text-[13px] font-medium no-underline",
                        "transition-colors px-3 whitespace-nowrap",
                        isActive
                            ? "bg-mf-card text-mf-ink shadow-mf-1"
                            : "bg-transparent text-mf-ink-2 hover:text-mf-ink",
                      ].join(" ")
                  }
              >
                {tab.name}
              </NavLink>
          ))}
        </div>

        <section className="mt-6">
          <Outlet context={plantContext} />
        </section>
      </div>

      <div>

        {isConfirmPopupOpen && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4
                     bg-mf-ink/40 backdrop-blur-sm animate-[fadeIn_.15s_ease-out]"
                onClick={() => setIsConfirmPopupOpen(false)}
            >
              <div
                  className="mf-card w-full max-w-sm p-7 text-center shadow-mf-3
                       animate-[scaleIn_.18s_ease-out]"
                  onClick={(e) => e.stopPropagation()}
              >
                <div className="h-14 w-14 mx-auto rounded-full bg-[#DCE7EC] text-mf-water
                            flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />
                  </svg>
                </div>
                <h2 className="mf-h2 text-2xl text-mf-ink">Water this plant?</h2>
                <p className="mt-1 text-sm text-mf-ink-3">
                  We'll trigger a manual watering cycle now.
                </p>
                <div className="flex gap-2 justify-center mt-6">
                  <button
                      className="mf-btn mf-btn-ghost"
                      onClick={() => setIsConfirmPopupOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                      className="mf-btn mf-btn-water disabled:opacity-40"
                      onClick={handleManualWatering}
                      disabled={isWatering}
                  >
                    {isWatering ? "Watering…" : "Water now"}
                  </button>
                </div>
              </div>
            </div>
        )}

      </div>
    </div>

      {wateringMessage && (
          <div
              className={[
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
                "whitespace-nowrap px-4 h-10 inline-flex items-center gap-2",
                "rounded-full text-lg font-medium shadow-mf-3",
                "animate-[scaleIn_.18s_ease-out]",
                wateringMessage.ok
                    ? "bg-mf-forest text-mf-cream"
                    : "bg-mf-err text-mf-cream",
              ].join(" ")}
          >
            <span className="mf-chip-dot bg-current opacity-80" />
            {wateringMessage.text}
          </div>
      )}
    </>
  );
}
