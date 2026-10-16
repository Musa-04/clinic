import { supabase } from "../supabaseClient";
import { logAdminAction, ADMIN_ACTION_TYPES } from "./adminActionLog";
import { requireAdminAuth } from "./adminAuth";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const isConfigured = () => Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

export { isConfigured };

const normalizeSupabaseOrder = (dbOrder) => {
  if (!dbOrder) return null;
  const items = Array.isArray(dbOrder.order_items)
    ? dbOrder.order_items.map((item) => ({
        id: item.product_id,
        productId: item.product_id,
        name: item.product_name,
        price: item.unit_price,
        quantity: item.quantity,
        subtotal: item.line_total,
        image: item.product_image_url,
      }))
    : [];
  const payment = dbOrder.payment || {};
  const statusHistory = Array.isArray(dbOrder.status_history)
    ? dbOrder.status_history
        .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
        .map((entry) => ({ status: entry.status, at: entry.created_at }))
    : [];
  const cancellation = dbOrder.cancellation || { cancelled: false, reason: "", cancelled_at: null };
  return {
    id: dbOrder.id,
    customer: {
      name: dbOrder.customer_name,
      phone: dbOrder.customer_phone,
      email: dbOrder.customer_email || "",
    },
    deliveryAddress: dbOrder.delivery_address || {},
    items,
    subtotal: Number(dbOrder.subtotal || 0),
    shipping: Number(dbOrder.shipping || 0),
    tax: Number(dbOrder.tax || 0),
    discount: Number(dbOrder.discount || 0),
    total: Number(dbOrder.total || 0),
    payment: {
      method: payment.method || "",
      status: payment.status || "PENDING_VERIFICATION",
      transactionId: payment.transaction_id || "",
      verifiedAt: payment.verified_at || null,
      failedAt: payment.failed_at || null,
      verifiedBy: payment.verified_by || null,
      failedBy: payment.failed_by || null,
    },
    orderStatus: dbOrder.order_status || "PENDING",
    statusHistory,
    cancellation,
    notes: dbOrder.notes || "",
    couponCode: dbOrder.coupon_code || "",
    createdAt: dbOrder.created_at || new Date().toISOString(),
    updatedAt: dbOrder.updated_at || new Date().toISOString(),
  };
};

// ---- Customer-facing order operations ----

export const createOrderViaSupabase = async (orderData) => {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const functionUrl = `${EDGE_FUNCTION_URL}/create-order`;

  // Send only what the server needs. Product images can be large base64 data URLs;
  // the Edge Function loads trusted product names, prices, and image URLs from the
  // database, so those client fields must not be sent back in the order request.
  const requestPayload = {
    orderId: orderData.orderId,
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customerEmail: orderData.customerEmail,
    deliveryAddress: orderData.deliveryAddress,
    notes: orderData.notes,
    couponCode: orderData.couponCode,
    subtotal: orderData.subtotal,
    shipping: orderData.shipping,
    tax: orderData.tax,
    discount: orderData.discount,
    total: orderData.total,
    ...(Number.isFinite(orderData.acceptedTotal)
      ? { acceptedTotal: orderData.acceptedTotal }
      : {}),
    items: (Array.isArray(orderData.items) ? orderData.items : []).map((item) => ({
      productId: item.productId ?? item.id,
      quantity: Number(item.quantity) || 1,
    })),
    payment: {
      method: orderData.payment?.method,
      transactionId: orderData.payment?.transactionId,
    },
  };

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(requestPayload),
  });

  // Some gateway/runtime failures return an empty or non-JSON response. Handle that
  // without masking the HTTP status with an unrelated JSON parse error.
  const responseText = await response.text();
  let result = {};
  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = { error: responseText || `Order service returned HTTP ${response.status}.` };
  }

  if (!response.ok || !result.success) {
    const error = new Error(
      result.error || `Order service returned HTTP ${response.status}. Please try again later.`,
    );
    // Surface the machine-readable code and authoritative breakdown (if any) so the
    // checkout can prompt the customer to confirm a recomputed total.
    error.status = response.status;
    error.code = result.code;
    error.totals = result.totals;
    throw error;
  }
  return {
    orderId: result.orderId,
    orderAccessToken: result.orderAccessToken,
    total: result.total,
  };
};

export const getOrderByAccessToken = async (orderAccessToken) => {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const params = new URLSearchParams();
  params.set("order_access_token", orderAccessToken);

  const functionUrl = `${EDGE_FUNCTION_URL}/get-orders?${params.toString()}`;
  const response = await fetch(functionUrl, {
    method: "GET",
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch order.");
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch order.");
  }

  return result.order ? normalizeSupabaseOrder(result.order) : null;
};

export const getOrderByIdFromSupabase = async (orderId) => {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        product_id,
        product_name,
        product_image_url,
        unit_price,
        quantity,
        line_total,
        created_at
      )
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  return normalizeSupabaseOrder(data);
};

// ---- Admin-facing order operations (authenticated) ----

export const getAllOrdersFromSupabase = async () => {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        product_id,
        product_name,
        product_image_url,
        unit_price,
        quantity,
        line_total,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeSupabaseOrder);
};

export const updateOrderStatusInSupabase = async (orderId, nextStatus, adminIdentity) => {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  requireAdminAuth(adminIdentity);

  const { data, error } = await supabase
    .from("orders")
    .select("order_status, status_history")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Order not found.");
  }

  const currentStatus = data.order_status;
  const allowedNextStatus = {
    CONFIRMED: "SHIPPED",
    SHIPPED: "DELIVERED",
  }[currentStatus];

  if (nextStatus !== allowedNextStatus) {
    throw new Error(
      `Cannot move an order from ${currentStatus} to ${nextStatus}.`,
    );
  }

  const changedAt = new Date().toISOString();
  const updatedStatusHistory = Array.isArray(data.status_history)
    ? [...data.status_history, { status: nextStatus, created_at: changedAt }]
    : [{ status: nextStatus, created_at: changedAt }];

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      order_status: nextStatus,
      status_history: updatedStatusHistory,
      updated_at: changedAt,
    })
    .eq("id", orderId);

  if (updateError) throw updateError;

  logAdminAction({
    actionType: ADMIN_ACTION_TYPES.ORDER_STATUS_UPDATE,
    adminIdentity: adminIdentity?.id || adminIdentity?.email || adminIdentity,
    targetId: orderId,
    targetType: "order",
    details: { previousStatus: currentStatus, newStatus: nextStatus },
  });

  return { id: orderId, orderStatus: nextStatus };
};

export const acceptOrderInSupabase = async (orderId, adminIdentity) => {
  return updateOrderStatusInSupabase(orderId, "CONFIRMED", adminIdentity);
};

export const cancelOrderInSupabase = async (orderId, reason, adminIdentity) => {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  requireAdminAuth(adminIdentity);

  const { data, error } = await supabase
    .from("orders")
    .select("order_status, status_history")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Order not found.");
  }

  const currentStatus = data.order_status;
  if (!["PENDING", "CONFIRMED"].includes(currentStatus)) {
    throw new Error("This order can no longer be cancelled.");
  }
  if (!reason?.trim()) throw new Error("A cancellation reason is required.");

  const cancelledAt = new Date().toISOString();
  const updatedStatusHistory = Array.isArray(data.status_history)
    ? [...data.status_history, { status: "CANCELLED", created_at: cancelledAt }]
    : [{ status: "CANCELLED", created_at: cancelledAt }];

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      order_status: "CANCELLED",
      cancellation: {
        cancelled: true,
        reason: reason.trim(),
        cancelled_at: cancelledAt,
      },
      status_history: updatedStatusHistory,
      updated_at: cancelledAt,
    })
    .eq("id", orderId);

  if (updateError) throw updateError;

  logAdminAction({
    actionType: ADMIN_ACTION_TYPES.ORDER_CANCEL,
    adminIdentity: adminIdentity?.id || adminIdentity?.email || adminIdentity,
    targetId: orderId,
    targetType: "order",
    details: { previousStatus: currentStatus, reason: reason.trim() },
  });

  return { id: orderId, orderStatus: "CANCELLED" };
};

export const verifyPaymentInSupabase = async (orderId, adminIdentity) => {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  requireAdminAuth(adminIdentity);

  const { data, error } = await supabase
    .from("orders")
    .select("payment")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Order not found.");
  }

  const payment = data.payment || {};
  if (payment.status !== "PENDING_VERIFICATION") {
    throw new Error("Payment cannot be verified because its status is not pending.");
  }

  const changedAt = new Date().toISOString();
  const updatedPayment = {
    ...payment,
    status: "VERIFIED",
    verified_at: changedAt,
    verified_by: adminIdentity?.id || adminIdentity?.email || adminIdentity,
  };

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      payment: updatedPayment,
      updated_at: changedAt,
    })
    .eq("id", orderId);

  if (updateError) throw updateError;

  logAdminAction({
    actionType: ADMIN_ACTION_TYPES.PAYMENT_VERIFY,
    adminIdentity: adminIdentity?.id || adminIdentity?.email || adminIdentity,
    targetId: orderId,
    targetType: "order",
    details: { paymentStatus: "VERIFIED" },
  });

  return { id: orderId, paymentStatus: "VERIFIED" };
};

export const failPaymentInSupabase = async (orderId, adminIdentity) => {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  requireAdminAuth(adminIdentity);

  const { data, error } = await supabase
    .from("orders")
    .select("payment")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Order not found.");
  }

  const changedAt = new Date().toISOString();
  const payment = data.payment || {};
  const updatedPayment = {
    ...payment,
    status: "FAILED",
    failed_at: changedAt,
    failed_by: adminIdentity?.id || adminIdentity?.email || adminIdentity,
  };

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      payment: updatedPayment,
      updated_at: changedAt,
    })
    .eq("id", orderId);

  if (updateError) throw updateError;

  logAdminAction({
    actionType: ADMIN_ACTION_TYPES.PAYMENT_FAIL,
    adminIdentity: adminIdentity?.id || adminIdentity?.email || adminIdentity,
    targetId: orderId,
    targetType: "order",
    details: { paymentStatus: "FAILED" },
  });

  return { id: orderId, paymentStatus: "FAILED" };
};