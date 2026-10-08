import {
  getOrderByIdStrict as readOrderById,
  getOrdersStrict as readOrders,
  normalizePaymentStatus,
  updateOrderStrict as updateOrder,
} from "../utils/orderStorage";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const ORDER_DATA_MODE = "localStorage development adapter";

const STATUS_ALIASES = {
  PLACED: "PENDING",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const normalizeOrderStatus = (order) => {
  if (order?.cancellation?.cancelled) return "CANCELLED";
  const status = String(order?.orderStatus || "PENDING").toUpperCase();
  return STATUS_ALIASES[status] || "UNKNOWN";
};

const normalizeOrder = (order) => ({
  ...order,
  orderStatus: normalizeOrderStatus(order),
});

const readAdminOrders = () => readOrders().map(normalizeOrder);

const getOrderOrThrow = (orderId) => {
  const order = readOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  return order;
};

const paymentForTransition = (order, expectedStatus) => {
  const payment = order.payment || {};
  if (normalizePaymentStatus(payment.status) !== expectedStatus) {
    throw new Error(`Payment cannot be updated because its status is ${normalizePaymentStatus(payment.status).toLowerCase()}.`);
  }
  return payment;
};

const persistPaymentStatus = (orderId, nextStatus, metadataKey, adminIdentity, requireTransaction = false) => {
  const order = getOrderOrThrow(orderId);
  const payment = paymentForTransition(order, "PENDING_VERIFICATION");
  if (requireTransaction && !String(payment.method || "").trim()) {
    throw new Error("Cannot verify payment because the payment method is missing.");
  }
  if (requireTransaction && !String(payment.transactionId || "").trim()) {
    throw new Error("Cannot verify payment because the transaction ID is missing.");
  }
  const changedAt = new Date().toISOString();
  const metadata = {
    ...payment,
    status: nextStatus,
    [metadataKey]: changedAt,
  };

  if (adminIdentity) {
    metadata[metadataKey === "verifiedAt" ? "verifiedBy" : "failedBy"] = adminIdentity;
  }

  return persistOrder(orderId, { payment: metadata });
};

const persistOrder = (orderId, updates) => {
  const updatedOrder = updateOrder(orderId, updates);
  if (!updatedOrder) throw new Error("Order not found.");
  return normalizeOrder(updatedOrder);
};

const statusHistoryFor = (order, nextStatus, changedAt) => {
  const history = Array.isArray(order.statusHistory)
    ? order.statusHistory
    : order.createdAt
      ? [{ status: normalizeOrderStatus(order), at: order.createdAt }]
      : [];
  return [...history, { status: nextStatus, at: changedAt }];
};

const persistStatus = (order, nextStatus, extraUpdates = {}, changedAt = new Date().toISOString()) => {
  return persistOrder(order.id, {
    ...extraUpdates,
    orderStatus: nextStatus,
    statusHistory: statusHistoryFor(order, nextStatus, changedAt),
  });
};

const localOrderAdapter = {
  async getOrders() {
    return readAdminOrders();
  },

  async refreshOrders() {
    return readAdminOrders();
  },

  async getOrderById(orderId) {
    const order = readOrderById(orderId);
    return order ? normalizeOrder(order) : null;
  },

  async acceptOrder(orderId) {
    const order = getOrderOrThrow(orderId);
    if (normalizeOrderStatus(order) !== "PENDING") {
      throw new Error("Only pending orders can be accepted.");
    }
    return persistStatus(order, "CONFIRMED");
  },

  async updateOrderStatus(orderId, nextStatus) {
    const order = getOrderOrThrow(orderId);
    const currentStatus = normalizeOrderStatus(order);
    const allowedNextStatus = {
      CONFIRMED: "SHIPPED",
      SHIPPED: "DELIVERED",
    }[currentStatus];

    if (nextStatus !== allowedNextStatus) {
      throw new Error(`Cannot move an order from ${currentStatus} to ${nextStatus}.`);
    }

    return persistStatus(order, nextStatus);
  },

  async cancelOrder(orderId, reason) {
    const order = getOrderOrThrow(orderId);
    const currentStatus = normalizeOrderStatus(order);
    if (!["PENDING", "CONFIRMED"].includes(currentStatus)) {
      throw new Error("This order can no longer be cancelled.");
    }
    if (!reason?.trim()) throw new Error("A cancellation reason is required.");

    const cancelledAt = new Date().toISOString();
    return persistStatus(order, "CANCELLED", {
      cancellation: {
        cancelled: true,
        reason: reason.trim(),
        cancelledAt,
      },
    }, cancelledAt);
  },

  async verifyPayment(orderId, adminIdentity) {
    return persistPaymentStatus(orderId, "VERIFIED", "verifiedAt", adminIdentity, true);
  },

  async failPayment(orderId, adminIdentity) {
    return persistPaymentStatus(orderId, "FAILED", "failedAt", adminIdentity);
  },
};

// Replace this adapter with authenticated server calls before production use.
export const adminOrderService = localOrderAdapter;