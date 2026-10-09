export const ORDERS_STORAGE_KEY = "maliks_orders";
const ORDER_SEQUENCE_KEY = "maliks_order_sequence";

const ORDER_STATUS_SEQUENCE = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const LEGACY_STATUS_MAP = {
  PLACED: "PENDING",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const normalizeStatusValue = (value) => {
  const normalized = String(value ?? "PENDING").trim().toUpperCase();
  return LEGACY_STATUS_MAP[normalized] || "PENDING";
};

export const normalizePaymentStatus = (value) => {
  const normalized = String(value ?? "PENDING VERIFICATION").trim();
  const upper = normalized.toUpperCase();
  if (upper === "VERIFIED" || upper === "PAID") return "VERIFIED";
  if (upper === "FAILED" || upper === "DECLINED") return "FAILED";
  if (upper === "PENDING" || upper === "PENDING_VERIFICATION" || upper === "PENDING VERIFICATION" || upper === "SUBMITTED") return "PENDING_VERIFICATION";
  return normalized || "PENDING VERIFICATION";
};

const notifyOrderChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("maliks-orders-updated"));
  }
};

export const canonicalizeOrder = (order) => {
  if (!order || typeof order !== "object") return order;

  const orderStatus = normalizeStatusValue(order.orderStatus);
  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        ...item,
        productId: item.productId ?? item.id ?? null,
        name: item.name ?? "Product",
        quantity: Number(item.quantity || 0) || 1,
        price: Number(item.price || 0),
        subtotal: Number(item.subtotal ?? Number(item.price || 0) * Number(item.quantity || 0)),
      }))
    : [];

  const subtotal = Number(order.subtotal || items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0);
  const shipping = Number(order.shipping || 0);
  const tax = Number(order.tax || 0);
  const discount = Number(order.discount || 0);
  const total = Number(order.total ?? subtotal + shipping + tax - discount);

  const baseHistory = Array.isArray(order.statusHistory)
    ? order.statusHistory.map((entry) => ({
        ...entry,
        status: normalizeStatusValue(entry?.status || entry?.orderStatus || orderStatus),
        at: entry?.at || entry?.createdAt || order.createdAt || new Date().toISOString(),
      }))
    : [];
  const hasCurrentStatus = baseHistory.some((entry) => normalizeStatusValue(entry.status) === orderStatus);
  const statusHistory = hasCurrentStatus
    ? baseHistory
    : [
        ...baseHistory,
        { status: orderStatus, at: order.createdAt || new Date().toISOString() },
      ];

  const cancellation = {
    cancelled: Boolean(order.cancellation?.cancelled || orderStatus === "CANCELLED"),
    reason: order.cancellation?.reason || "",
    cancelledAt: order.cancellation?.cancelledAt || null,
  };

  return {
    ...order,
    id: order.id,
    createdAt: order.createdAt || new Date().toISOString(),
    customer: {
      name: order.customer?.name || "",
      phone: order.customer?.phone || "",
      email: order.customer?.email || "",
    },
    deliveryAddress: {
      address: order.deliveryAddress?.address || "",
      city: order.deliveryAddress?.city || "",
      state: order.deliveryAddress?.state || "",
      pincode: order.deliveryAddress?.pincode || "",
      country: order.deliveryAddress?.country || "India",
    },
    notes: String(order.notes || order.customerNotes || order.message || "").trim(),
    couponCode: String(order.couponCode || "").trim().toUpperCase(),
    items,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    payment: {
      ...(order.payment || {}),
      method: order.payment?.method || "",
      status: normalizePaymentStatus(order.payment?.status),
      transactionId: order.payment?.transactionId || "",
    },
    orderStatus,
    statusHistory,
    cancellation,
  };
};

export const applyOrderStatus = (order, nextStatus, extraUpdates = {}, changedAt = new Date().toISOString()) => {
  const baseOrder = canonicalizeOrder(order);
  const normalizedNextStatus = normalizeStatusValue(nextStatus);
  const history = Array.isArray(baseOrder.statusHistory) ? [...baseOrder.statusHistory] : [];

  if (!history.some((entry) => normalizeStatusValue(entry.status) === normalizedNextStatus)) {
    history.push({ status: normalizedNextStatus, at: changedAt });
  }

  const cancellation = {
    ...(baseOrder.cancellation || {}),
    ...(extraUpdates.cancellation || {}),
  };

  if (normalizedNextStatus === "CANCELLED") {
    cancellation.cancelled = true;
    cancellation.cancelledAt = cancellation.cancelledAt || changedAt;
  } else if (cancellation.cancelled && normalizedNextStatus !== "CANCELLED") {
    cancellation.cancelled = false;
  }

  return canonicalizeOrder({
    ...baseOrder,
    ...extraUpdates,
    orderStatus: normalizedNextStatus,
    statusHistory: history,
    cancellation,
  });
};

export const getOrdersStrict = () => {
  const rawOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!rawOrders) return [];
  const savedOrders = JSON.parse(rawOrders);
  if (!Array.isArray(savedOrders)) {
    throw new Error("Stored orders must be an array.");
  }
  return savedOrders.map(canonicalizeOrder);
};

export const getOrders = () => {
  try {
    return getOrdersStrict();
  } catch {
    return [];
  }
};

export const getOrderByIdStrict = (orderId) =>
  getOrdersStrict().find((order) => order.id === orderId) || null;

export const getOrderById = (orderId) =>
  getOrders().find((order) => order.id === orderId) || null;

export const generateOrderId = (orders = getOrders(), date = new Date()) => {
  const fiscalYearStart = date.getMonth() >= 3
    ? date.getFullYear()
    : date.getFullYear() - 1;
  const fiscalYear = `${String(fiscalYearStart).slice(-2)}-${String(
    fiscalYearStart + 1,
  ).slice(-2)}`;
  const prefix = `ORD-${fiscalYear}-`;
  const lastSequence = orders.reduce((highest, order) => {
    if (!order.id?.startsWith(prefix)) return highest;
    const sequence = Number(order.id.slice(prefix.length));
    return Number.isInteger(sequence) ? Math.max(highest, sequence) : highest;
  }, 0);
  let lastIssuedSequence = 0;
  try {
    lastIssuedSequence = Number(
      window.localStorage.getItem(ORDER_SEQUENCE_KEY),
    ) || 0;
  } catch {
    lastIssuedSequence = 0;
  }
  const nextSequence = Math.max(lastSequence, lastIssuedSequence) + 1;
  try {
    window.localStorage.setItem(ORDER_SEQUENCE_KEY, String(nextSequence));
  } catch {
    // Order persistence will report storage failures when saveOrder runs.
  }

  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
};

export const calculateOrderTotals = (items = [], extras = {}) => {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const shipping = Number.isFinite(Number(extras.shipping)) ? Number(extras.shipping) : 0;
  const tax = Number.isFinite(Number(extras.tax)) ? Number(extras.tax) : 0;
  const discount = Number.isFinite(Number(extras.discount)) ? Math.max(0, Number(extras.discount)) : 0;

  return {
    subtotal,
    shipping,
    tax,
    discount,
    total: Math.max(0, subtotal + shipping + tax - discount),
  };
};

export const saveOrder = (order) => {
  const normalizedOrder = canonicalizeOrder(order);
  const orders = getOrders();
  if (orders.some((savedOrder) => savedOrder.id === normalizedOrder.id)) {
    throw new Error("This order ID already exists.");
  }

  window.localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify([normalizedOrder, ...orders]),
  );
  notifyOrderChange();
  return normalizedOrder;
};

export const updateOrder = (orderId, updates) => {
  const orders = getOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) return null;

  const updatedOrder = canonicalizeOrder({ ...orders[index], ...updates });
  orders[index] = updatedOrder;
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  notifyOrderChange();
  return updatedOrder;
};

export const formatOrderDate = (value, options = {}) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", options).format(date);
};

export const updateOrderStrict = (orderId, updates) => {
  const orders = getOrdersStrict();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) return null;

  const updatedOrder = canonicalizeOrder({ ...orders[index], ...updates });
  orders[index] = updatedOrder;
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  notifyOrderChange();
  return updatedOrder;
};

export const getStatusOrderIndex = (status) => {
  const normalized = normalizeStatusValue(status);
  return ORDER_STATUS_SEQUENCE.indexOf(normalized);
};

export const isValidStatusTransition = (currentStatus, nextStatus) => {
  const currentIndex = getStatusOrderIndex(currentStatus);
  const nextIndex = getStatusOrderIndex(nextStatus);
  if (currentIndex === -1 || nextIndex === -1) return false;
  return nextIndex > currentIndex;
};