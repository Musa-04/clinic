export const ORDERS_STORAGE_KEY = "maliks_orders";
const ORDER_SEQUENCE_KEY = "maliks_order_sequence";

const notifyOrderChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("maliks-orders-updated"));
  }
};

export const getOrdersStrict = () => {
  const rawOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!rawOrders) return [];
  const savedOrders = JSON.parse(rawOrders);
  if (!Array.isArray(savedOrders)) {
    throw new Error("Stored orders must be an array.");
  }
  return savedOrders;
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

export const calculateOrderTotals = (items = []) => {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const shipping = 0;
  const tax = 0;

  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
};

export const saveOrder = (order) => {
  const orders = getOrders();
  if (orders.some((savedOrder) => savedOrder.id === order.id)) {
    throw new Error("This order ID already exists.");
  }

  window.localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify([order, ...orders]),
  );
  notifyOrderChange();
  return order;
};

export const updateOrder = (orderId, updates) => {
  const orders = getOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) return null;

  const updatedOrder = { ...orders[index], ...updates };
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

  const updatedOrder = { ...orders[index], ...updates };
  orders[index] = updatedOrder;
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  notifyOrderChange();
  return updatedOrder;
};