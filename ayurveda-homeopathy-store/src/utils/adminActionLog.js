const ADMIN_ACTION_LOG_KEY = "maliks_admin_action_log";
const MAX_LOG_ENTRIES = 500;

const getStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new Error("Browser storage is not available.");
  }
  return window.localStorage;
};

const readLog = () => {
  const raw = getStorage().getItem(ADMIN_ACTION_LOG_KEY);
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLog = (entries) => {
  try {
    getStorage().setItem(ADMIN_ACTION_LOG_KEY, JSON.stringify(entries));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("Browser storage is full. Clear some space before saving.");
    }
    throw new Error("Admin action log could not be saved to browser storage.");
  }
};

export const logAdminAction = (action) => {
  const log = readLog();
  const entry = {
    id: globalThis.crypto?.randomUUID?.() || `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...action,
  };
  log.unshift(entry);
  if (log.length > MAX_LOG_ENTRIES) {
    log.length = MAX_LOG_ENTRIES;
  }
  writeLog(log);
  return entry;
};

export const getAdminActionLog = (options = {}) => {
  const { limit = 100, offset = 0, actionType, adminIdentity, startDate, endDate } = options;
  let log = readLog();

  if (actionType) {
    log = log.filter((entry) => entry.actionType === actionType);
  }
  if (adminIdentity) {
    log = log.filter((entry) => entry.adminIdentity === adminIdentity);
  }
  if (startDate) {
    const start = new Date(startDate).getTime();
    log = log.filter((entry) => new Date(entry.timestamp).getTime() >= start);
  }
  if (endDate) {
    const end = new Date(endDate).getTime();
    log = log.filter((entry) => new Date(entry.timestamp).getTime() <= end);
  }

  return log.slice(offset, offset + limit);
};

export const getAdminActionLogCount = (filters = {}) => {
  return getAdminActionLog({ ...filters, limit: Infinity }).length;
};

export const clearAdminActionLog = () => {
  writeLog([]);
};

export const ADMIN_ACTION_TYPES = {
  ORDER_ACCEPT: "order_accept",
  ORDER_STATUS_UPDATE: "order_status_update",
  ORDER_CANCEL: "order_cancel",
  PAYMENT_VERIFY: "payment_verify",
  PAYMENT_FAIL: "payment_fail",
  CATEGORY_ADD: "category_add",
  CATEGORY_UPDATE: "category_update",
  CATEGORY_DELETE: "category_delete",
  COUPON_ADD: "coupon_add",
  COUPON_UPDATE: "coupon_update",
  COUPON_DELETE: "coupon_delete",
  SETTINGS_UPDATE: "settings_update",
};