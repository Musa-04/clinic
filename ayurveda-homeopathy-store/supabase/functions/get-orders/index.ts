import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("get-orders: required server configuration is missing");
    return jsonResponse({ error: "Order lookup is temporarily unavailable." }, 500);
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("order_access_token") ?? "";
  if (!/^[0-9a-f]{64}$/i.test(token)) {
    return jsonResponse({ error: "A valid order access token is required." }, 400);
  }

  let tokenHash: string;
  try {
    tokenHash = await hashToken(token);
  } catch {
    console.error("get-orders: token hashing failed");
    return jsonResponse({ error: "Order lookup is temporarily unavailable." }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      notes,
      coupon_code,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      order_status,
      cancellation,
      payment,
      status_history,
      created_at,
      updated_at,
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
    .eq("order_access_token_hash", tokenHash)
    .gt("order_access_token_expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("get-orders: database lookup failed", error.code ?? "unknown");
    return jsonResponse({ error: "Order could not be retrieved right now." }, 500);
  }

  if (!order) {
    return jsonResponse({ error: "Order access token is invalid or expired." }, 404);
  }

  const rawItems = Array.isArray(order.order_items) ? order.order_items : [];
  const items = rawItems.map((item: Record<string, unknown>) => ({
    id: item.product_id,
    productId: item.product_id,
    name: item.product_name,
    price: Number(item.unit_price ?? 0),
    quantity: Number(item.quantity ?? 0),
    subtotal: Number(item.line_total ?? 0),
    image: typeof item.product_image_url === "string" ? item.product_image_url : "",
  }));

  const payment = isRecord(order.payment) ? order.payment : {};
  const rawHistory = Array.isArray(order.status_history) ? order.status_history : [];
  const statusHistory = rawHistory
    .filter(isRecord)
    .sort((a, b) => new Date(String(a.created_at ?? 0)).getTime() - new Date(String(b.created_at ?? 0)).getTime())
    .map((entry) => ({ status: String(entry.status ?? ""), at: String(entry.created_at ?? "") }));

  const normalizedOrder = {
    id: order.id,
    customer: {
      name: order.customer_name,
      phone: order.customer_phone,
      email: order.customer_email || "",
    },
    deliveryAddress: order.delivery_address || {},
    items,
    subtotal: Number(order.subtotal ?? 0),
    shipping: Number(order.shipping ?? 0),
    tax: Number(order.tax ?? 0),
    discount: Number(order.discount ?? 0),
    total: Number(order.total ?? 0),
    payment: {
      method: String(payment.method ?? ""),
      status: String(payment.status ?? "PENDING_VERIFICATION"),
      transactionId: String(payment.transaction_id ?? ""),
      verifiedAt: payment.verified_at ?? null,
      failedAt: payment.failed_at ?? null,
      verifiedBy: payment.verified_by ?? null,
      failedBy: payment.failed_by ?? null,
    },
    orderStatus: String(order.order_status ?? "PENDING"),
    statusHistory,
    cancellation: order.cancellation || { cancelled: false, reason: "", cancelled_at: null },
    notes: String(order.notes ?? ""),
    couponCode: String(order.coupon_code ?? ""),
    createdAt: order.created_at || new Date().toISOString(),
    updatedAt: order.updated_at || new Date().toISOString(),
  };

  return jsonResponse({ success: true, order: normalizedOrder }, 200);
});
