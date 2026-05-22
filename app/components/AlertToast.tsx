import { useEffect, useState } from "react";
import { useAlerts } from "~/context/AlertsContext";
import { ThermometerIcon } from "~/components/icons/icons-specific/Thermometer";
import { DropIcon } from "~/components/icons/icons-specific/Drop";
import { SunIcon } from "~/components/icons/icons-specific/Sun";
import type { Alert } from "~/model/alerts/types";

const TOAST_DURATION_MS = 5000;

function AlertIcon({ type }: { type: Alert["type"] }) {
  const t = type?.toLowerCase() ?? "";
  if (t.includes("moisture") || t.includes("water") || t.includes("humidity")) return <DropIcon />;
  if (t.includes("temperature")) return <ThermometerIcon />;
  if (t.includes("light")) return <SunIcon />;
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  );
}

export default function AlertToast() {
  const { toastAlert, dismissToast } = useAlerts();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toastAlert) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(dismissToast, 300);
    }, TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [toastAlert]);

  if (!toastAlert && !visible) return null;

  const isErr = toastAlert?.severity === "critical";
  const isWarn = toastAlert?.severity === "warning";
  const borderColor = isErr ? "border-l-mf-err" : isWarn ? "border-l-mf-warn" : "border-l-mf-forest";
  const iconBg = isErr ? "bg-mf-err/10 text-mf-err" : isWarn ? "bg-mf-warn/12 text-mf-warn" : "bg-mf-forest/10 text-mf-forest";

  return (
    <div
      aria-live="assertive"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md pointer-events-none`}
    >
      <div
        className={`pointer-events-auto bg-mf-card border border-mf-line border-l-4 ${borderColor} rounded-[16px] shadow-mf-3 p-4 flex items-start gap-3 transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
        }`}
      >
        {toastAlert && (
          <>
            <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <AlertIcon type={toastAlert.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-mf-ink leading-snug">{toastAlert.message}</p>
              {toastAlert.setupId && (
                <p className="text-[11px] text-mf-ink-3 mt-0.5">Setup #{toastAlert.setupId}</p>
              )}
            </div>
            <button
              onClick={() => { setVisible(false); setTimeout(dismissToast, 300); }}
              className="text-mf-ink-4 hover:text-mf-ink transition-colors flex-shrink-0 p-0.5"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
