import { useAlerts } from "~/context/AlertsContext";
import { ThermometerIcon } from "~/components/icons/icons-specific/Thermometer";
import { DropIcon } from "~/components/icons/icons-specific/Drop";
import { SunIcon } from "~/components/icons/icons-specific/Sun";
import type { Alert } from "~/model/alerts/types";

function formatTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  if (Math.floor(diffH / 24) === 1) return "Yesterday";
  return `${Math.floor(diffH / 24)}d ago`;
}

function AlertIcon({ type, severity }: { type: Alert["type"]; severity: Alert["severity"] }) {
  const isErr = severity === "critical";
  const isWarn = severity === "warning";
  const color = isErr ? "text-mf-err" : isWarn ? "text-mf-warn" : "text-mf-forest";
  const bg = isErr ? "bg-mf-err/10" : isWarn ? "bg-mf-warn/12" : "bg-mf-forest/10";
  const t = type?.toLowerCase() ?? "";
  return (
    <div className={`w-9 h-9 rounded-full ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
      {t.includes("moisture") || t.includes("water") || t.includes("humidity")
        ? <DropIcon />
        : t.includes("temperature")
        ? <ThermometerIcon />
        : t.includes("light")
        ? <SunIcon />
        : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
          </svg>
        )
      }
    </div>
  );
}

export default function AlertsPage() {
  const { alerts, unreadCount, markRead, markAllRead } = useAlerts();

  return (
    <div className="px-4 sm:px-6 max-w-2xl mx-auto py-4 sm:py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-serif text-[28px] sm:text-[34px] tracking-tight text-mf-ink">Alerts</h1>
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
          {alerts.map((alert) => {
            const isUnread = alert.status !== "read" && alert.status !== "dismissed";
            return (
              <button
                key={alert.id}
                type="button"
                onClick={() => isUnread && markRead(alert.id)}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-mf-lg border shadow-mf-1 transition-colors ${
                  isUnread
                    ? "bg-mf-cream border-mf-line-2 hover:bg-mf-card cursor-pointer"
                    : "bg-mf-card border-mf-line cursor-default"
                }`}
              >
                <AlertIcon type={alert.type} severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] text-mf-ink leading-snug ${isUnread ? "font-semibold" : "font-normal"}`}>
                    {alert.message}
                  </p>
                  <p className="text-[12px] text-mf-ink-3 mt-0.5">
                    {alert.setupId ? `Setup #${alert.setupId}` : ""}
                    {alert.plantId ? ` · Plant #${alert.plantId}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[11px] text-mf-ink-4">{formatTime(alert.triggeredAt)}</span>
                  {isUnread && <div className="w-2 h-2 rounded-full bg-mf-forest" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
