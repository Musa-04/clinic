import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};

const ORDER_ACCESS_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_ORDER_ITEMS = 50;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 100;

// MVP checkout rule: free shipping on all orders and no tax.
// This intentionally matches the current checkout UI. The admin's clinic settings
// currently live in browser storage, so the Edge Function must not read a separate,
// potentially stale clinic_settings database table as a second source of truth.
// Client totals are still rechecked against trusted database product prices below.
// Coupon discounts remain disabled until coupon rules can be validated server-side.
const STANDARD_TAX = 0;
const SERVER_SHIPPING_FEE = 0;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function cents(value: number): number {
  return Math.round(money(value) * 100);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function generateOrderAccessToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string): Promise<string> {
  if (!supabaseServiceKey) {
    throw new Error("Required server configuration is missing.");
  }
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(supabaseServiceKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("create-order: required server configuration is missing");
    return jsonResponse({ error: "Order service is temporarily unavailable." }, 500);
  }

  const contentLength = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: "Order request is too large." }, 413);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Request body must contain valid JSON." }, 400);
  }

  if (!isRecord(body)) {
    return jsonResponse({ error: "Invalid order request." }, 400);
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerPhone = typeof body.customerPhone === "string" ? body.customerPhone.trim() : "";
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const couponCode = typeof body.couponCode === "string" ? body.couponCode.trim() : "";
  const deliveryAddress = isRecord(body.deliveryAddress) ? body.deliveryAddress : {};
  const items = body.items;
  const paymentInput = isRecord(body.payment) ? body.payment : {};

  if (!orderId || orderId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(orderId)) {
    return jsonResponse({ error: "A valid order ID is required." }, 400);
  }
  if (!customerName || customerName.length > 160) {
    return jsonResponse({ error: "A valid customer name is required." }, 400);
  }
  if (!customerPhone || customerPhone.length > 40) {
    return jsonResponse({ error: "A valid customer phone number is required." }, 400);
  }
  if (customerEmail.length > 254) {
    return jsonResponse({ error: "Customer email is too long." }, 400);
  }
  if (!Array.isArray(items) || items.length < 1 || items.length > MAX_ORDER_ITEMS) {
    return jsonResponse({ error: `An order must contain between 1 and ${MAX_ORDER_ITEMS} items.` }, 400);
  }

  // Never trust client-supplied totals, shipping, tax, or discounts. The amounts the
  // customer saw are captured only to detect a price change so the authoritative
  // amount (recomputed below from active products + clinic settings) can be shown
  // for confirmation. These values are never persisted or charged directly.
  const clientSubtotal = money(Number(body.subtotal) || 0);
  const clientShipping = money(Number(body.shipping) || 0);
  const clientTax = money(Number(body.tax) || 0);
  const clientTotal = money(Number(body.total) || 0);
  const acceptedTotalRaw = Number(body.acceptedTotal);
  const acceptedTotal = Number.isFinite(acceptedTotalRaw) ? money(acceptedTotalRaw) : NaN;

  // Coupons are stored client-side (localStorage) and cannot be validated by the
  // server yet, so discount codes are rejected here until they can be validated
  // server-side.
  if (couponCode || Number(body.discount || 0) !== 0) {
    return jsonResponse({ error: "Coupon discounts are temporarily unavailable. Remove the coupon and try again." }, 400);
  }

  const methodRaw = typeof paymentInput.method === "string" ? paymentInput.method.trim().toUpperCase() : "UPI";
  const paymentMethod = methodRaw === "COD" || methodRaw === "CASH ON DELIVERY"
    ? "CASH_ON_DELIVERY"
    : methodRaw;
  if (!(["UPI", "CASH_ON_DELIVERY", "OTHER"] as string[]).includes(paymentMethod)) {
    return jsonResponse({ error: "Select a supported payment method." }, 400);
  }
  const transactionId = typeof paymentInput.transactionId === "string"
    ? paymentInput.transactionId.trim()
    : "";
  if (paymentMethod === "UPI" && !transactionId) {
    return jsonResponse({ error: "Enter your UPI transaction reference." }, 400);
  }
  if (transactionId.length > 160) {
    return jsonResponse({ error: "The transaction reference is too long." }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Check for an existing order. The primary key remains the final duplicate guard.
  const { data: existingOrder, error: lookupError } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();

  if (lookupError) {
    console.error("create-order: duplicate-check database operation failed", lookupError.code ?? "unknown");
    return jsonResponse({ error: "Order service could not validate this request. Please try again later." }, 500);
  }
  if (existingOrder) {
    return jsonResponse({ error: "This order has already been submitted." }, 409);
  }

  // A UPI transaction reference must not be reused for a different order.
  // The payment metadata is stored in the existing JSONB column on orders.
  if (paymentMethod === "UPI" && transactionId) {
    const { data: existingPayment, error: paymentLookupError } = await supabase
      .from("orders")
      .select("id")
      .contains("payment", { transaction_id: transactionId })
      .maybeSingle();

    if (paymentLookupError) {
      console.error("create-order: payment duplicate-check failed", paymentLookupError.code ?? "unknown");
      return jsonResponse({ error: "Payment reference could not be validated. Please try again later." }, 500);
    }
    if (existingPayment) {
      return jsonResponse({ error: "This UPI transaction reference has already been used." }, 409);
    }
  }

  const validatedItems: Array<{
    product_id: string;
    product_name: string;
    product_image_url: string | null;
    unit_price: number;
    quantity: number;
  }> = [];
  let computedSubtotal = 0;

  for (const rawItem of items) {
    if (!isRecord(rawItem)) {
      return jsonResponse({ error: "One of the order items is invalid." }, 400);
    }
    const productIdValue = rawItem.productId ?? rawItem.product_id;
    const productId = typeof productIdValue === "string" ? productIdValue.trim() : "";
    const quantity = Number(rawItem.quantity);

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId)) {
      return jsonResponse({ error: "An order item refers to an invalid product." }, 400);
    }
    if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
      return jsonResponse({ error: "Each item quantity must be between 1 and 100." }, 400);
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, image_url, price, is_active")
      .eq("id", productId)
      .maybeSingle();

    if (productError) {
      console.error("create-order: product lookup failed", productError.code ?? "unknown");
      return jsonResponse({ error: "Products could not be validated. Please try again later." }, 500);
    }
    if (!product || product.is_active !== true) {
      return jsonResponse({ error: "One of the selected products is unavailable. Refresh the catalog and try again." }, 400);
    }

    const unitPrice = Number(product.price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      console.error("create-order: invalid stored product price");
      return jsonResponse({ error: "A product price could not be validated." }, 500);
    }
    const lineTotal = money(unitPrice * quantity);
    computedSubtotal = money(computedSubtotal + lineTotal);
    validatedItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image_url: typeof product.image_url === "string" ? product.image_url : null,
      unit_price: money(unitPrice),
      quantity,
    });
  }

  // Trusted server-side rules for this MVP: free shipping, no tax, and no discount.
  const computedShipping = SERVER_SHIPPING_FEE;
  const computedTax = STANDARD_TAX;
  const computedDiscount = 0;
  const computedTotal = money(computedSubtotal + computedShipping + computedTax - computedDiscount);

  // Total reconciliation. If the freshly computed amount differs from what the
  // customer's cart showed, return the authoritative breakdown and require explicit
  // confirmation (acceptedTotal) before creating the order. This guarantees the
  // customer is never silently charged a different amount.
  const totalAcknowledged =
    Number.isFinite(acceptedTotal) && cents(acceptedTotal) === cents(computedTotal);
  const totalsMatch =
    cents(computedSubtotal) === cents(clientSubtotal) &&
    cents(computedShipping) === cents(clientShipping) &&
    cents(computedTax) === cents(clientTax) &&
    cents(computedTotal) === cents(clientTotal);
  if (!totalsMatch && !totalAcknowledged) {
    return jsonResponse(
      {
        success: false,
        error:
          "The order total has changed. Please review the updated amount and confirm to place your order.",
        code: "TOTALS_CHANGED",
        totals: {
          subtotal: computedSubtotal,
          shipping: computedShipping,
          tax: computedTax,
          discount: computedDiscount,
          total: computedTotal,
        },
      },
      409,
    );
  }

  let orderAccessToken: string;
  let tokenHash: string;
  try {
    orderAccessToken = generateOrderAccessToken();
    tokenHash = await hashToken(orderAccessToken);
  } catch {
    console.error("create-order: token generation failed");
    return jsonResponse({ error: "Secure order creation is temporarily unavailable." }, 500);
  }
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ORDER_ACCESS_TOKEN_TTL_MS).toISOString();

  const paymentRecord = {
    method: paymentMethod,
    status: "PENDING_VERIFICATION",
    transaction_id: transactionId || null,
    created_at: now,
  };
  const statusHistory = [{ status: "PENDING", created_at: now }];

  const { error: orderError } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      delivery_address: deliveryAddress,
      // The existing orders table requires a non-null JSONB `items` column.
      // Keep the legacy JSON shape used by the admin UI, with values derived
      // from active product records (not the client's untrusted prices/images).
      items: validatedItems.map((item) => ({
        productId: item.product_id,
        name: item.product_name,
        image: item.product_image_url,
        price: item.unit_price,
        quantity: item.quantity,
        subtotal: money(item.unit_price * item.quantity),
      })),
      notes: notes.slice(0, 2000),
      coupon_code: "",
      subtotal: computedSubtotal,
      shipping: computedShipping,
      tax: computedTax,
      discount: computedDiscount,
      total: computedTotal,
      order_status: "PENDING",
      order_access_token_hash: tokenHash,
      order_access_token_expires_at: expiresAt,
      payment: paymentRecord,
      status_history: statusHistory,
      cancellation: { cancelled: false, reason: "", cancelled_at: null },
    });

  if (orderError) {
    console.error("create-order: order insert failed", {
      code: orderError.code ?? "unknown",
      message: orderError.message ?? "unknown",
      details: orderError.details ?? null,
      hint: orderError.hint ?? null,
    });
    if (orderError.code === "23505") {
      return jsonResponse({ error: "This order has already been submitted." }, 409);
    }
    return jsonResponse({ error: "We could not save your order. Please try again later." }, 500);
  }

  const itemsToInsert = validatedItems.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    product_name: item.product_name,
    product_image_url: item.product_image_url,
    unit_price: item.unit_price,
    quantity: item.quantity,
    // line_total is generated by Postgres and must not be supplied.
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);
  if (itemsError) {
    console.error("create-order: item insert failed", itemsError.code ?? "unknown");
    const { error: rollbackError } = await supabase.from("orders").delete().eq("id", orderId);
    if (rollbackError) {
      console.error("create-order: rollback failed", rollbackError.code ?? "unknown");
    }
    return jsonResponse({ error: "We could not save the order items. No order confirmation was issued." }, 500);
  }

  return jsonResponse({
    success: true,
    orderId,
    orderAccessToken,
    total: computedTotal,
    totals: {
      subtotal: computedSubtotal,
      shipping: computedShipping,
      tax: computedTax,
      discount: computedDiscount,
      total: computedTotal,
    },
    message: "Order created successfully",
  }, 201);
});
