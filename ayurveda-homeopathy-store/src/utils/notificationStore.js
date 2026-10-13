export const NOTIFICATIONS_STORAGE_KEY = "maliks_notifications";
const NOTIFICATION_EVENT = "maliks-notifications-updated";
const MAX_NOTIFICATIONS = 60;

let idCounter = 0;
const makeId = () =>
  `note-${Date.now().toString(36)}-${(idCounter++).toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

const emitChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATION_EVENT));
  }
};

export const readNotifications = () => {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeNotifications = (next) => {
  try {
    window.localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // Storage may be unavailable or full; same-tab listeners still fire below.
  }
  emitChange();
};

/**
 * Push a notification for a given audience.
 * @param {Object} payload
 * @param {"admin"|"user"|"all"} payload.audience - who should be alerted.
 * @param {string} payload.type - order | appointment | payment | product | success | warning | info
 * @param {string} payload.title
 * @param {string} payload.message
 * @param {Object} [payload.meta] - optional extra data (e.g. orderId).
 */
export const pushNotification = ({
  audience = "user",
  type = "info",
  title = "Notification",
  message = "",
  meta = {},
} = {}) => {
  const notification = {
    id: makeId(),
    audience,
    type,
    title,
    message,
    meta,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const next = [notification, ...readNotifications()].slice(
    0,
    MAX_NOTIFICATIONS,
  );
  writeNotifications(next);
  return notification;
};

export const markAllRead = (audience) => {
  const next = readNotifications().map((notification) =>
    audience &&
    notification.audience !== audience &&
    notification.audience !== "all"
      ? notification
      : { ...notification, read: true },
  );
  writeNotifications(next);
};

export const clearNotifications = (audience) => {
  const next = audience
    ? readNotifications().filter(
        (notification) =>
          notification.audience !== audience &&
          notification.audience !== "all",
      )
    : [];
  writeNotifications(next);
};
