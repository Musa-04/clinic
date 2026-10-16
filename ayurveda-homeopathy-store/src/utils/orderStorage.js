export const ORDERS_STORAGE_KEY = "maliks_orders";
const ORDER_SEQUENCE_KEY = "maliks_order_sequence";

const ORDER_STATUS_SEQUENCE = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const LEGACY_STATUS_MAP = {
  PLACED: "PENDING",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const normalizeStatusValue = (value) => {
  const normalized = String(value ?? "PENDING")
    .trim()
    .toUpperCase();
  return LEGACY_STATUS_MAP[normalized] || "PENDING";
};

export const normalizePaymentStatus = (value) => {
  const normalized = String(value ?? "PENDING VERIFICATION").trim();
  const upper = normalized.toUpperCase();
  if (upper === "VERIFIED" || upper === "PAID") return "VERIFIED";
  if (upper === "FAILED" || upper === "DECLINED") return "FAILED";
  if (
    upper === "PENDING" ||
    upper === "PENDING_VERIFICATION" ||
    upper === "PENDING VERIFICATION" ||
    upper === "SUBMITTED"
  )
    return "PENDING_VERIFICATION";
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
        subtotal: Number(
          item.subtotal ?? Number(item.price || 0) * Number(item.quantity || 0),
        ),
      }))
    : [];

  const subtotal = Number(
    order.subtotal ||
      items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) ||
      0,
  );
  const shipping = Number(order.shipping || 0);
  const tax = Number(order.tax || 0);
  const discount = Number(order.discount || 0);
  const total = Number(order.total ?? subtotal + shipping + tax - discount);

  const baseHistory = Array.isArray(order.statusHistory)
    ? order.statusHistory.map((entry) => ({
        ...entry,
        status: normalizeStatusValue(
          entry?.status || entry?.orderStatus || orderStatus,
        ),
        at:
          entry?.at ||
          entry?.createdAt ||
          order.createdAt ||
          new Date().toISOString(),
      }))
    : [];
  const hasCurrentStatus = baseHistory.some(
    (entry) => normalizeStatusValue(entry.status) === orderStatus,
  );
  const statusHistory = hasCurrentStatus
    ? baseHistory
    : [
        ...baseHistory,
        {
          status: orderStatus,
          at: order.createdAt || new Date().toISOString(),
        },
      ];

  const cancellation = {
    cancelled: Boolean(
      order.cancellation?.cancelled || orderStatus === "CANCELLED",
    ),
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
    notes: String(
      order.notes || order.customerNotes || order.message || "",
    ).trim(),
    couponCode: String(order.couponCode || "")
      .trim()
      .toUpperCase(),
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

export const applyOrderStatus = (
  order,
  nextStatus,
  extraUpdates = {},
  changedAt = new Date().toISOString(),
) => {
  const baseOrder = canonicalizeOrder(order);
  const normalizedNextStatus = normalizeStatusValue(nextStatus);
  const history = Array.isArray(baseOrder.statusHistory)
    ? [...baseOrder.statusHistory]
    : [];

  if (
    !history.some(
      (entry) => normalizeStatusValue(entry.status) === normalizedNextStatus,
    )
  ) {
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

export const INITIAL_SEED_ORDERS = [
  {
    id: "ORD-26-27-0001",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    customer: {
      name: "Rajesh Sharma",
      phone: "+91 98201 45872",
      email: "rajesh.sharma@gmail.com",
    },
    deliveryAddress: {
      address: "Flat 402, Nilgiri Heights, MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    },
    notes: "Please deliver in evening after 5 PM.",
    couponCode: "",
    items: [
      {
        id: 2,
        productId: 2,
        name: "Joint Wellness Formula",
        price: 349,
        quantity: 2,
        subtotal: 698,
      },
      {
        id: 1,
        productId: 1,
        name: "Herbal Digestive Support",
        price: 299,
        quantity: 1,
        subtotal: 299,
      },
    ],
    subtotal: 997,
    shipping: 50,
    tax: 0,
    discount: 0,
    total: 1047,
    payment: {
      method: "UPI (Google Pay)",
      status: "VERIFIED",
      transactionId: "UPI98234710293",
      verifiedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    orderStatus: "CONFIRMED",
    statusHistory: [
      {
        status: "PENDING",
        at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      { status: "CONFIRMED", at: new Date(Date.now() - 3600000).toISOString() },
    ],
    cancellation: { cancelled: false, reason: "", cancelledAt: null },
  },
  {
    id: "ORD-26-27-0002",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    customer: {
      name: "Priya Patel",
      phone: "+91 94265 88219",
      email: "priya.patel92@yahoo.com",
    },
    deliveryAddress: {
      address: "B-12, Shanti Niketan Society, Satellite",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380015",
      country: "India",
    },
    notes: "Doctor recommended these drops for seasonal allergy.",
    couponCode: "HEALTH50",
    items: [
      {
        id: 6,
        productId: 6,
        name: "Women's Wellness Formula",
        price: 399,
        quantity: 1,
        subtotal: 399,
      },
      {
        id: 4,
        productId: 4,
        name: "Skin Wellness Drops",
        price: 249,
        quantity: 2,
        subtotal: 498,
      },
    ],
    subtotal: 897,
    shipping: 0,
    tax: 0,
    discount: 50,
    total: 847,
    payment: {
      method: "UPI (PhonePe)",
      status: "PENDING_VERIFICATION",
      transactionId: "TXN-PHN-881923",
    },
    orderStatus: "PENDING",
    statusHistory: [
      {
        status: "PENDING",
        at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
    cancellation: { cancelled: false, reason: "", cancelledAt: null },
  },
  {
    id: "ORD-26-27-0003",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    customer: {
      name: "Mohammed Farhan",
      phone: "+91 97412 30981",
      email: "farhan.m@outlook.com",
    },
    deliveryAddress: {
      address: "House 78, 4th Cross, Koramangala 5th Block",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560095",
      country: "India",
    },
    notes: "Call before delivery. Fragile bottle packaging please.",
    couponCode: "",
    items: [
      {
        id: 3,
        productId: 3,
        name: "Respiratory Care Drops",
        price: 199,
        quantity: 3,
        subtotal: 597,
      },
      {
        id: 5,
        productId: 5,
        name: "Stress Relief Support",
        price: 229,
        quantity: 1,
        subtotal: 229,
      },
    ],
    subtotal: 826,
    shipping: 40,
    tax: 0,
    discount: 0,
    total: 866,
    payment: {
      method: "Cash on Delivery (COD)",
      status: "PENDING_VERIFICATION",
      transactionId: "COD-VERIFY-003",
    },
    orderStatus: "SHIPPED",
    statusHistory: [
      { status: "PENDING", at: new Date(Date.now() - 86400000).toISOString() },
      {
        status: "CONFIRMED",
        at: new Date(Date.now() - 72000000).toISOString(),
      },
      { status: "SHIPPED", at: new Date(Date.now() - 36000000).toISOString() },
    ],
    cancellation: { cancelled: false, reason: "", cancelledAt: null },
  },
  {
    id: "ORD-26-27-0004",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    customer: {
      name: "Ananya Sen",
      phone: "+91 98300 76543",
      email: "ananya.sen@rediffmail.com",
    },
    deliveryAddress: {
      address: "15/2A, Southern Avenue, Lake Gardens",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700029",
      country: "India",
    },
    notes: "Received in good condition with doctor's prescription.",
    couponCode: "SAVE100",
    items: [
      {
        id: 4,
        productId: 4,
        name: "Skin Wellness Drops",
        price: 249,
        quantity: 1,
        subtotal: 249,
      },
      {
        id: 1,
        productId: 1,
        name: "Herbal Digestive Support",
        price: 299,
        quantity: 2,
        subtotal: 598,
      },
      {
        id: 5,
        productId: 5,
        name: "Stress Relief Support",
        price: 229,
        quantity: 2,
        subtotal: 458,
      },
    ],
    subtotal: 1305,
    shipping: 0,
    tax: 0,
    discount: 100,
    total: 1205,
    payment: {
      method: "Net Banking (HDFC)",
      status: "VERIFIED",
      transactionId: "HDFC9982310023",
      verifiedAt: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
    },
    orderStatus: "DELIVERED",
    statusHistory: [
      {
        status: "PENDING",
        at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        status: "CONFIRMED",
        at: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
      },
      { status: "SHIPPED", at: new Date(Date.now() - 86400000).toISOString() },
      {
        status: "DELIVERED",
        at: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
    cancellation: { cancelled: false, reason: "", cancelledAt: null },
  },
  {
    id: "ORD-26-27-0005",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
    customer: {
      name: "Vikramaditya Singh",
      phone: "+91 99103 45678",
      email: "vikram.singh.rajput@gmail.com",
    },
    deliveryAddress: {
      address: "Villa 22, Heritage Park, Vaishali Nagar",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302021",
      country: "India",
    },
    notes: "Prescribed by Dr. Mozim Malik for elderly parents.",
    couponCode: "",
    items: [
      {
        id: 2,
        productId: 2,
        name: "Joint Wellness Formula",
        price: 349,
        quantity: 3,
        subtotal: 1047,
      },
      {
        id: 6,
        productId: 6,
        name: "Women's Wellness Formula",
        price: 399,
        quantity: 1,
        subtotal: 399,
      },
    ],
    subtotal: 1446,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 1446,
    payment: {
      method: "UPI (Paytm)",
      status: "PENDING_VERIFICATION",
      transactionId: "PTM918237190",
    },
    orderStatus: "PENDING",
    statusHistory: [
      {
        status: "PENDING",
        at: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
    ],
    cancellation: { cancelled: false, reason: "", cancelledAt: null },
  },
];

export const seedDefaultOrders = () => {
  const seeded = INITIAL_SEED_ORDERS.map(canonicalizeOrder);
  try {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(seeded));
    notifyOrderChange();
  } catch (err) {
    console.warn("Could not seed orders to localStorage", err);
  }
  return seeded;
};

export const getOrdersStrict = () => {
  const rawOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!rawOrders) {
    return seedDefaultOrders();
  }
  try {
    const savedOrders = JSON.parse(rawOrders);
    if (!Array.isArray(savedOrders)) {
      return seedDefaultOrders();
    }
    if (savedOrders.length === 0) {
      return seedDefaultOrders();
    }
    return savedOrders.map(canonicalizeOrder);
  } catch {
    return seedDefaultOrders();
  }
};

export const getOrders = () => {
  try {
    return getOrdersStrict();
  } catch {
    return INITIAL_SEED_ORDERS.map(canonicalizeOrder);
  }
};

export const getOrderByIdStrict = (orderId) =>
  getOrdersStrict().find((order) => order.id === orderId) || null;

export const getOrderById = (orderId) =>
  getOrders().find((order) => order.id === orderId) || null;

export const generateOrderId = (orders = getOrders(), date = new Date()) => {
  const fiscalYearStart =
    date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
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
    lastIssuedSequence =
      Number(window.localStorage.getItem(ORDER_SEQUENCE_KEY)) || 0;
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

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const calculateOrderTotals = (items = [], extras = {}) => {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const shipping = Number.isFinite(Number(extras.shipping))
    ? Number(extras.shipping)
    : 0;
  const tax = Number.isFinite(Number(extras.tax)) ? Number(extras.tax) : 0;
  const discount = Number.isFinite(Number(extras.discount))
    ? Math.max(0, Number(extras.discount))
    : 0;

  // Round every component to 2 decimals using the same rule as the Edge Function
  // (money()) so the amount displayed here is identical to the server total.
  const roundedSubtotal = roundMoney(subtotal);
  const roundedShipping = roundMoney(shipping);
  const roundedTax = roundMoney(tax);
  const roundedDiscount = roundMoney(discount);

  return {
    subtotal: roundedSubtotal,
    shipping: roundedShipping,
    tax: roundedTax,
    discount: roundedDiscount,
    total: Math.max(
      0,
      roundMoney(roundedSubtotal + roundedShipping + roundedTax - roundedDiscount),
    ),
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
