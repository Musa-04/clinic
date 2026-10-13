import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clearNotifications,
  markAllRead,
  pushNotification,
  readNotifications,
} from "../utils/notificationStore";
import {
  isSoundMuted,
  persistSoundMuted,
  playNotificationSound,
} from "../utils/notificationSound";

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

const isRelevant = (notification, audience) =>
  notification.audience === audience || notification.audience === "all";

export const NotificationProvider = ({ audience = "user", children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [soundMuted, setSoundMuted] = useState(() => isSoundMuted());
  const seenIdsRef = useRef(null);
  const toastTimersRef = useRef({});

  const syncFromStore = useCallback(() => {
    const all = readNotifications();
    const scoped = all.filter((notification) => isRelevant(notification, audience));

    // On first read, remember which notifications already existed so we don't
    // replay a burst of historical alerts as toasts on mount.
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(scoped.map((notification) => notification.id));
    } else {
      const seen = seenIdsRef.current;
      const fresh = scoped.filter((notification) => !seen.has(notification.id));
      fresh.forEach((notification) => seen.add(notification.id));
      if (fresh.length > 0) {
        setToasts((current) => {
          const merged = [...fresh.map((n) => ({ ...n })), ...current];
          return merged.slice(0, 4);
        });
        playNotificationSound();
      }
    }

    setNotifications(scoped);
  }, [audience]);

  useEffect(() => {
    // Reset the dedupe baseline whenever the audience changes so switching
    // surfaces (user <-> admin) does not immediately replay stale toasts.
    seenIdsRef.current = null;
    syncFromStore();

    const handleUpdate = () => syncFromStore();
    const handleStorage = (event) => {
      if (event.key === null || event.key === "maliks_notifications") {
        syncFromStore();
      }
    };

    window.addEventListener("maliks-notifications-updated", handleUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("maliks-notifications-updated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncFromStore]);

  // Auto-dismiss each toast after a few seconds.
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toastTimersRef.current[toast.id]) return;
      toastTimersRef.current[toast.id] = window.setTimeout(() => {
        dismissToast(toast.id);
      }, 6000);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts]);

  useEffect(
    () => () => {
      Object.values(toastTimersRef.current).forEach((timer) =>
        window.clearTimeout(timer),
      );
      toastTimersRef.current = {};
    },
    [],
  );

  const dismissToast = useCallback((id) => {
    const timer = toastTimersRef.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete toastTimersRef.current[id];
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const toggleSound = useCallback(() => {
    setSoundMuted((current) => {
      const next = !current;
      persistSoundMuted(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      audience,
      notifications,
      toasts,
      unreadCount,
      soundMuted,
      dismissToast,
      toggleSound,
      pushNotification,
      markAllRead: () => markAllRead(audience),
      clearNotifications: () => clearNotifications(audience),
    }),
    [
      audience,
      notifications,
      toasts,
      unreadCount,
      soundMuted,
      dismissToast,
      toggleSound,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
