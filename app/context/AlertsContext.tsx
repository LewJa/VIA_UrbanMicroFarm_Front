import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { alertsService } from "~/services/alertsService";
import type { Alert } from "~/model/alerts/types";
import { useAuth } from "./AuthContext";

interface AlertsContextValue {
  alerts: Alert[];
  unreadCount: number;
  toastAlert: Alert | null;
  dismissToast: () => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  refresh: () => void;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [toastAlert, setToastAlert] = useState<Alert | null>(null);
  const knownIdsRef = useRef<Set<number>>(new Set());
  const firstLoadRef = useRef(true);

  const fetchAlerts = async () => {
    if (!user) return;
    try {
      const data = await alertsService.getAlerts(user.id);
      setAlerts(data);

      const newUnread = data.filter(
        (a) => !knownIdsRef.current.has(a.id) && a.status !== "read" && a.status !== "dismissed"
      );
      data.forEach((a) => knownIdsRef.current.add(a.id));

      if (!firstLoadRef.current && newUnread.length > 0) {
        setToastAlert(newUnread[0]);
      }
      firstLoadRef.current = false;
    } catch {}
  };

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      knownIdsRef.current = new Set();
      firstLoadRef.current = true;
      return;
    }
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const markRead = async (id: number) => {
    try {
      await alertsService.updateAlertStatus(id, "read");
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "read" } : a)));
    } catch {}
  };

  const markAllRead = async () => {
    const unread = alerts.filter((a) => a.status !== "read" && a.status !== "dismissed");
    await Promise.all(unread.map((a) => alertsService.updateAlertStatus(a.id, "read").catch(() => {})));
    setAlerts((prev) => prev.map((a) => ({ ...a, status: "read" as const })));
  };

  const dismissToast = () => setToastAlert(null);
  const unreadCount = alerts.filter((a) => a.status !== "read" && a.status !== "dismissed").length;

  return (
    <AlertsContext.Provider value={{ alerts, unreadCount, toastAlert, dismissToast, markRead, markAllRead, refresh: fetchAlerts }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used inside AlertsProvider");
  return ctx;
}
