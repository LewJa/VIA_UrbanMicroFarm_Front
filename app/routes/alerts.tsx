import { useState } from "react";
import { ThermometerIcon } from "~/components/icons/icons-specific/Thermometer";
import { DropIcon } from "~/components/icons/icons-specific/Drop";
import { SunIcon } from "~/components/icons/icons-specific/Sun";

interface Alert {
  id: number;
  type: "moisture" | "temperature" | "humidity" | "light" | "sensor";
  severity: "warn" | "err";
  message: string;
  setupName: string;
  plantName?: string;
  timestamp: Date;
  isRead: boolean;
}

// Placeholder data — replace with API call when endpoint is available
const MOCK_ALERTS: Alert[] = [
  {
    id: 1,
    type: "moisture",
    severity: "warn",
    message: "Soil moisture is critically low",
    setupName: "Balcony Garden",
    plantName: "Basil",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
  },
  {
    id: 2,
    type: "temperature",
    severity: "err",
    message: "Temperature exceeded 35°C",
    setupName: "Kitchen Setup",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
  },
  {
    id: 3,
    type: "humidity",
    severity: "warn",
    message: "Humidity dropped below 40%",
    setupName: "Balcony Garden",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: 4,
    type: "moisture",
    severity: "warn",
    message: "Soil moisture is low — consider watering",
    setupName: "Balcony Garden",
    plantName: "Mint",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 5,
    type: "light",
    severity: "warn",
    message: "Light levels below optimal range",
    setupName: "Kitchen Setup",
    plantName: "Thyme",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
  },
];

function formatTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  if (Math.floor(diffH / 24) === 1) return "Yesterday";
  return `${Math.floor(diffH / 24)}d ago`;
}

function AlertTypeIcon({ type, severity }: { type: Alert["type"]; severity: Alert["severity"] }) {
  const color = severity === "err" ? "text-mf-err" : "text-mf-warn";
  const bg = severity === "err" ? "bg-mf-err/10" : "bg-mf-warn/12";
  return (
    <div className={`w-9 h-9 rounded-full ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
      {type === "temperature" && <ThermometerIcon />}
      {(type === "moisture" || type === "humidity") && <DropIcon />}
      {type === "light" && <SunIcon />}
      {type === "sensor" && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        </svg>
      )}
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const markAllRead = () =>
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));

  const markRead = (id: number) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));

  return (
    <div className="px-4 sm:px-6 max-w-2xl mx-auto py-4 sm:py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-serif text-[28px] sm:text-[34px] tracking-tight text-mf-ink">
            Alerts
          </h1>
          <p className="text-[13px] text-mf-ink-3 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[13px] font-medium text-mf-forest hover:text-mf-forest-2 transition-colors mb-0.5"
          >
            Mark all read
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="mf-card flex flex-col items-center text-center p-10 border-dashed border-mf-line-2 bg-mf-cream/60">
          <div className="mf-photo mf-photo-leaf rounded-mf-md mb-5 h-16 w-16 flex items-center justify-center">
            <span className="font-mono text-[10px]">alerts</span>
          </div>
          <h2 className="font-serif text-xl text-mf-ink">No alerts</h2>
          <p className="mt-1 text-sm text-mf-ink-3 max-w-sm">
            All your setups are healthy. You'll be notified here when something needs attention.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => !alert.isRead && markRead(alert.id)}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-mf-lg border shadow-mf-1 transition-colors ${
                !alert.isRead
                  ? "bg-mf-cream border-mf-line-2 hover:bg-mf-card cursor-pointer"
                  : "bg-mf-card border-mf-line cursor-default"
              }`}
            >
              <AlertTypeIcon type={alert.type} severity={alert.severity} />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[14px] text-mf-ink leading-snug ${
                    !alert.isRead ? "font-semibold" : "font-normal"
                  }`}
                >
                  {alert.message}
                </p>
                <p className="text-[12px] text-mf-ink-3 mt-0.5">
                  {alert.setupName}
                  {alert.plantName ? ` · ${alert.plantName}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-[11px] text-mf-ink-4">{formatTime(alert.timestamp)}</span>
                {!alert.isRead && (
                  <div className="w-2 h-2 rounded-full bg-mf-forest" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
