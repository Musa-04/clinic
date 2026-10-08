import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDownUp,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  CircleUserRound,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Tag,
  Truck,
  Users,
  X,
} from "lucide-react";
import {
  adminOrderService,
  ORDER_DATA_MODE,
  ORDER_STATUSES,
  normalizeOrderStatus,
} from "../services/adminOrderService";
import { formatOrderDate } from "../utils/orderStorage";

const STATUS_FILTERS = ["ALL", ...ORDER_STATUSES];
const CANCEL_REASONS = [
  "Customer requested cancellation",
  "Product unavailable",
  "Payment issue",
  "Address issue",
  "Unable to fulfill order",
  "Other",
];

const NAV_ITEMS = [
  { label: "Dashboard", Icon: LayoutDashboard },
  { label: "Orders", Icon: ClipboardList, active: true },
  { label: "Products", Icon: Package },
  { label: "Categories", Icon: Tag },
  { label: "Customers", Icon: Users },
  { label: "Analytics", Icon: BarChart3 },
  { label: "Reviews", Icon: BadgeCheck },
  { label: "Coupons", Icon: ShoppingBag },
  { label: "Settings", Icon: Settings },
];

const STATUS_STYLE = {
  PENDING: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  CONFIRMED: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  SHIPPED: "border-indigo-400/20 bg-indigo-400/10 text-indigo-200",
  DELIVERED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  CANCELLED: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

const PAYMENT_STYLE = {
  VERIFIED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  FAILED: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  "PENDING VERIFICATION": "border-amber-400/20 bg-amber-400/10 text-amber-200",
  SUBMITTED: "border-amber-400/20 bg-amber-400/10 text-amber-200",
};

const money = (amount) => {
  const value = Number(amount);
  return Number.isFinite(value) ? `₹${value.toLocaleString("en-IN")}` : "Not recorded";
};

const getPaymentStatus = (order) =>
  order.payment?.status || "Not recorded";

const getStatusTimestamp = (order, status) => {
  if (status === "PENDING") return order.createdAt || null;
  if (status === "CANCELLED") return order.cancellation?.cancelledAt || null;
  const history = Array.isArray(order.statusHistory) ? [...order.statusHistory].reverse() : [];
  const entry = history.find((event) => String(event.status || event.orderStatus || "").toUpperCase() === status);
  return entry?.at || entry?.createdAt || null;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const refreshSequence = useRef(0);

  const showToast = (message) => {
    setToast(message);
    setActionError("");
  };

  const refreshOrders = async (announceRefresh = false) => {
    const requestSequence = ++refreshSequence.current;
    if (announceRefresh) setIsRefreshing(true);
    try {
      const latestOrders = await adminOrderService.refreshOrders();
      if (requestSequence !== refreshSequence.current) return;
      setOrders(latestOrders);
      setLoadError("");
      setActionError("");
      setSelectedOrder((current) =>
        current
          ? latestOrders.find((order) => order.id === current.id) || null
          : null,
      );
      if (announceRefresh) showToast("Orders refreshed.");
    } catch {
      if (requestSequence === refreshSequence.current) {
        setLoadError("Orders could not be loaded. Please try refreshing again.");
      }
    } finally {
      if (requestSequence === refreshSequence.current) {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void refreshOrders();
    }, 0);
    const handleOrdersChanged = () => refreshOrders();
    window.addEventListener("storage", handleOrdersChanged);
    window.addEventListener("maliks-orders-updated", handleOrdersChanged);
    window.addEventListener("focus", handleOrdersChanged);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("storage", handleOrdersChanged);
      window.removeEventListener("maliks-orders-updated", handleOrdersChanged);
      window.removeEventListener("focus", handleOrdersChanged);
    };
  }, []);

  useEffect(() => {
    if (!confirmAction) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setConfirmAction(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmAction]);

  useEffect(() => {
    if (!selectedOrder) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedOrder(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrder]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const filteredOrders = useMemo(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) return [];
    const normalizedSearch = search.trim().toLowerCase();
    return orders.filter((order) => {
      const status = normalizeOrderStatus(order);
      const paymentMethod = String(order.payment?.method || "").trim().toUpperCase();
      const paymentStatus = String(order.payment?.status || "").trim().toUpperCase();
      const createdAt = new Date(order.createdAt);
      const searchMatches =
        !normalizedSearch ||
        [order.id, order.customer?.name, order.customer?.phone, order.customer?.email].some((value) =>
          String(value || "").toLowerCase().includes(normalizedSearch),
        );
      const statusMatches = statusFilter === "ALL" || status === statusFilter;
      const paymentMatches = paymentFilter === "ALL" || paymentMethod === paymentFilter;
      const paymentStatusMatches = paymentStatusFilter === "ALL" || paymentStatus === paymentStatusFilter;
      const validOrderDate = !Number.isNaN(createdAt.getTime());
      const fromMatches = !dateFrom || (validOrderDate && createdAt >= new Date(`${dateFrom}T00:00:00`));
      const toMatches = !dateTo || (validOrderDate && createdAt <= new Date(`${dateTo}T23:59:59.999`));
      return searchMatches && statusMatches && paymentMatches && paymentStatusMatches && fromMatches && toMatches;
    });
  }, [orders, search, statusFilter, paymentFilter, paymentStatusFilter, dateFrom, dateTo]);
  const invalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo);

  const summary = useMemo(() => {
    const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0]));
    orders.forEach((order) => {
      const status = normalizeOrderStatus(order);
      if (Object.hasOwn(counts, status)) counts[status] += 1;
    });
    return counts;
  }, [orders]);

  const allVisibleSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((order) => selectedOrders.includes(order.id));

  const toggleAll = () => {
    setSelectedOrders((current) =>
      allVisibleSelected
        ? current.filter((id) => !filteredOrders.some((order) => order.id === id))
        : [...new Set([...current, ...filteredOrders.map((order) => order.id)])],
    );
  };

  const performAction = async () => {
    if (!confirmAction) return;
    const { type, order } = confirmAction;
    setPendingActionId(order.id);
    try {
      if (type === "accept") {
        await adminOrderService.acceptOrder(order.id);
        showToast("Order accepted successfully.");
      } else if (type === "status") {
        await adminOrderService.updateOrderStatus(order.id, confirmAction.status);
        showToast(`Order marked ${confirmAction.status.toLowerCase()}.`);
      } else if (type === "cancel") {
        const reason = cancelReason === "Other" ? otherReason.trim() : cancelReason;
        if (!reason) {
          setActionError("Select a cancellation reason to continue.");
          return;
        }
        await adminOrderService.cancelOrder(order.id, reason);
        showToast("Order cancelled.");
      }
      setConfirmAction(null);
      setCancelReason("");
      setOtherReason("");
      await refreshOrders();
    } catch {
      setActionError(type === "cancel"
        ? "The order could not be cancelled. Refresh and try again."
        : type === "status"
          ? "The order status could not be updated. Refresh and try again."
          : "The order could not be accepted. Refresh and try again.");
    } finally {
      setPendingActionId(null);
    }
  };

  const requestStatusUpdate = (order, status) => {
    setActionError("");
    setConfirmAction({ type: "status", status, order });
  };

  const openOrderDetails = async (order) => {
    setDetailLoading(true);
    setSelectedOrder(order);
    try {
      const latestOrder = await adminOrderService.getOrderById(order.id);
      if (!latestOrder) {
        setSelectedOrder(null);
        setActionError("That order could not be found. Refresh the order list and try again.");
      } else {
        setSelectedOrder(latestOrder);
      }
    } catch {
      setSelectedOrder(null);
      setActionError("Order details could not be loaded. Refresh and try again.");
    } finally {
      setDetailLoading(false);
    }
  };

  const actionForOrder = (order) => {
    const status = normalizeOrderStatus(order);
    return (
      <div className="flex flex-wrap items-center gap-2">
        {status === "PENDING" && (
          <button type="button" disabled={pendingActionId === order.id} onClick={() => { setActionError(""); setConfirmAction({ type: "accept", order }); }} className="min-h-9 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-wait disabled:opacity-60">
            {pendingActionId === order.id ? "Saving..." : "Accept Order"}
          </button>
        )}
        {status === "CONFIRMED" && (
          <button type="button" disabled={pendingActionId === order.id} onClick={() => requestStatusUpdate(order, "SHIPPED")} className="min-h-9 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-wait disabled:opacity-60">
            Mark as Shipped
          </button>
        )}
        {status === "SHIPPED" && (
          <button type="button" disabled={pendingActionId === order.id} onClick={() => requestStatusUpdate(order, "DELIVERED")} className="min-h-9 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-wait disabled:opacity-60">
            Mark as Delivered
          </button>
        )}
        {["PENDING", "CONFIRMED"].includes(status) && (
          <button type="button" disabled={pendingActionId === order.id} onClick={() => { setCancelReason(""); setOtherReason(""); setActionError(""); setConfirmAction({ type: "cancel", order }); }} className="min-h-9 rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-60">
            Cancel
          </button>
        )}
        <button type="button" onClick={() => openOrderDetails(order)} disabled={pendingActionId === order.id} className="min-h-9 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-50">
          View
        </button>
      </div>
    );
  };

  const renderStatus = (order) => {
    const status = normalizeOrderStatus(order);
    return <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[status] || "border-white/10 bg-white/5 text-stone-300"}`}>{status}</span>;
  };

  const renderPayment = (order) => {
    const paymentStatus = getPaymentStatus(order);
    const style = PAYMENT_STYLE[paymentStatus.toUpperCase()] || "border-white/10 bg-white/5 text-stone-300";
    return (
      <div className="min-w-36">
        <p className="text-xs font-medium text-white">{order.payment?.method || "Not recorded"}</p>
        <span className={`mt-1 inline-flex max-w-full rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>{paymentStatus}</span>
      </div>
    );
  };

  const paymentOptions = [...new Set(orders.map((order) => String(order.payment?.method || "").trim()).filter(Boolean))];
  const paymentStatusOptions = [...new Set(orders.map((order) => String(order.payment?.status || "").trim()).filter(Boolean))];

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 lg:flex">
      {mobileNavOpen && (
        <button type="button" aria-label="Close admin navigation" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-40 bg-black/70 lg:hidden" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-neutral-950 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex min-h-20 items-center justify-between border-b border-white/10 px-5">
          <div>
            <p className="text-sm font-bold text-white">Malik's Polyclinic</p>
            <p className="mt-1 text-xs text-stone-500">Admin Panel</p>
          </div>
          <button type="button" aria-label="Close admin navigation" onClick={() => setMobileNavOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-400 hover:bg-white/5 lg:hidden">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Admin sections" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {NAV_ITEMS.map(({ label, Icon, active }) => (
            <button
              key={label}
              type="button"
              disabled={!active}
              title={active ? "Order Management" : `${label} is not part of this module yet`}
              onClick={() => active && setMobileNavOpen(false)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${active ? "bg-emerald-500/10 text-emerald-300" : "cursor-not-allowed text-stone-600"}`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-[11px] leading-5 text-stone-500">
          <p className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" /> Development data adapter</p>
          <p className="mt-1">{ORDER_DATA_MODE}</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/95 backdrop-blur-sm">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" aria-label="Open admin navigation" onClick={() => setMobileNavOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-stone-300 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 lg:hidden">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-xs text-stone-500">Admin / Orders</p>
                <h1 className="truncate text-sm font-semibold text-white">Order Management</h1>
              </div>
            </div>
            <button type="button" onClick={() => refreshOrders(true)} disabled={isRefreshing} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-stone-300 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait disabled:opacity-60">
              <ArrowDownUp className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              <span>{isRefreshing ? "Refreshing..." : "Refresh orders"}</span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">Store operations</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Order Management</h2>
              <p className="mt-2 text-sm text-stone-400">View, accept, update and track all orders in real time</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/15 bg-amber-400/5 px-3 py-1.5 text-[11px] font-medium text-amber-200">
              <CircleUserRound className="h-3.5 w-3.5" aria-hidden="true" /> No admin authentication configured
            </span>
          </div>

          <section aria-label="Order summaries" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {[
              { label: "Total Orders", value: orders.length, Icon: ShoppingBag, tint: "text-white" },
              { label: "Pending", value: summary.PENDING, Icon: Activity, tint: "text-amber-200" },
              { label: "Confirmed", value: summary.CONFIRMED, Icon: CheckCircle2, tint: "text-sky-200" },
              { label: "Shipped", value: summary.SHIPPED, Icon: Truck, tint: "text-indigo-200" },
              { label: "Delivered", value: summary.DELIVERED, Icon: Package, tint: "text-emerald-200" },
            ].map(({ label, value, Icon, tint }) => (
              <article key={label} className="min-w-0 rounded-xl border border-white/10 bg-neutral-900 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-stone-400">{label}</p>
                  <Icon className={`h-4 w-4 shrink-0 ${tint}`} aria-hidden="true" />
                </div>
                <p className={`mt-3 text-2xl font-bold ${tint}`}>{value}</p>
              </article>
            ))}
          </section>

          <section className="mt-6 rounded-xl border border-white/10 bg-neutral-900 p-4 sm:p-5">
            <div className="grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_auto_auto_auto_auto] xl:items-center">
              <label className="relative block min-w-0">
                <span className="sr-only">Search orders by ID, customer name, phone, or email</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by order ID, name, phone, or email..." className="min-h-11 w-full rounded-lg border border-white/10 bg-neutral-950 pl-10 pr-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              </label>
              <label className="block min-w-0">
                <span className="sr-only">Filter payment method</span>
                <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="min-h-11 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-sm text-stone-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20">
                  <option value="ALL">All payment methods</option>
                  {paymentOptions.map((method) => <option key={method} value={method.toUpperCase()}>{method}</option>)}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="sr-only">Filter payment status</span>
                <select value={paymentStatusFilter} onChange={(event) => setPaymentStatusFilter(event.target.value)} className="min-h-11 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-sm text-stone-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20">
                  <option value="ALL">All payment statuses</option>
                  {paymentStatusOptions.map((status) => <option key={status} value={status.toUpperCase()}>{status}</option>)}
                </select>
              </label>
              <label className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-neutral-950 px-3">
                <span className="shrink-0 text-xs text-stone-500">From</span>
                <input aria-label="Start date" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="min-h-11 min-w-0 w-full bg-transparent text-xs text-stone-200 focus:outline-none" />
              </label>
              <label className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-neutral-950 px-3">
                <span className="shrink-0 text-xs text-stone-500">To</span>
                <input aria-label="End date" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="min-h-11 min-w-0 w-full bg-transparent text-xs text-stone-200 focus:outline-none" />
              </label>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by order status">
              {STATUS_FILTERS.map((status) => (
                <button key={status} type="button" onClick={() => setStatusFilter(status)} aria-pressed={statusFilter === status} className={`min-h-9 shrink-0 rounded-lg border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${statusFilter === status ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-white/10 text-stone-400 hover:bg-white/5 hover:text-stone-200"}`}>
                  {status === "ALL" ? "All Orders" : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            {invalidDateRange && <p role="alert" className="mt-3 text-xs text-rose-300">The start date must be on or before the end date.</p>}
          </section>

          {(loadError || actionError) && <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"><span>{loadError || actionError}</span>{loadError && <button type="button" onClick={() => refreshOrders(true)} disabled={isRefreshing} className="min-h-9 rounded-lg border border-rose-200/20 px-3 text-xs font-semibold hover:bg-rose-400/10 disabled:opacity-50">Try again</button>}</div>}

          <section className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Orders</h3>
                <p className="mt-1 text-xs text-stone-500">{filteredOrders.length} matching order{filteredOrders.length === 1 ? "" : "s"}</p>
              </div>
              {selectedOrders.length > 0 && <span className="text-xs text-stone-400">{selectedOrders.length} selected</span>}
            </div>

            {isInitialLoading ? (
              <div role="status" className="px-5 py-16 text-center text-sm text-stone-400">Loading orders...</div>
            ) : loadError ? (
              <div className="px-5 py-16 text-center"><h4 className="text-sm font-semibold text-white">Orders unavailable</h4><p className="mt-1 text-xs text-stone-500">Use refresh to try loading the order source again.</p></div>
            ) : filteredOrders.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-stone-600" aria-hidden="true" />
                <h4 className="mt-3 text-sm font-semibold text-white">No orders found</h4>
                <p className="mt-1 text-xs text-stone-500">{invalidDateRange ? "Choose a valid date range." : orders.length === 0 ? "Orders will appear here when customers place them." : "Try changing your search or filters."}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-262.5 border-collapse text-left">
                  <thead className="bg-neutral-950/70 text-[11px] uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="w-10 px-4 py-3"><input aria-label="Select all visible orders" type="checkbox" checked={allVisibleSelected} onChange={toggleAll} className="h-4 w-4 accent-emerald-500" /></th>
                      <th className="px-3 py-3 font-medium">Order ID</th>
                      <th className="px-3 py-3 font-medium">Customer</th>
                      <th className="px-3 py-3 font-medium">Products</th>
                      <th className="px-3 py-3 font-medium">Amount</th>
                      <th className="px-3 py-3 font-medium">Payment</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">Order Date</th>
                      <th className="px-3 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="transition hover:bg-white/2.5">
                        <td className="px-4 py-4"><input aria-label={`Select order ${order.id}`} type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => setSelectedOrders((current) => current.includes(order.id) ? current.filter((id) => id !== order.id) : [...current, order.id])} className="h-4 w-4 accent-emerald-500" /></td>
                        <td className="px-3 py-4"><button type="button" onClick={() => openOrderDetails(order)} className="max-w-40 truncate text-xs font-semibold text-emerald-300 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">{order.id}</button></td>
                        <td className="px-3 py-4"><p className="max-w-44 truncate text-xs font-medium text-white">{order.customer?.name || "Customer"}</p><p className="mt-1 text-[11px] text-stone-400">{order.customer?.phone || "Phone not provided"}</p>{order.customer?.email && <p className="mt-1 max-w-44 truncate text-[11px] text-stone-500">{order.customer.email}</p>}</td>
                        <td className="px-3 py-4"><p className="max-w-48 text-xs text-stone-200">{(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} item{(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0) === 1 ? "" : "s"}</p><p className="mt-1 max-w-48 truncate text-[11px] text-stone-500">{(order.items || []).map((item) => item.name).filter(Boolean).join(", ")}</p></td>
                        <td className="px-3 py-4 text-xs font-semibold text-white">{money(order.total)}</td>
                        <td className="px-3 py-4">{renderPayment(order)}</td>
                        <td className="px-3 py-4">{renderStatus(order)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-xs text-stone-400">{formatOrderDate(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}</td>
                        <td className="px-3 py-4">{actionForOrder(order)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {toast && <div role="status" className="fixed bottom-4 right-4 z-70 max-w-[calc(100vw-2rem)] rounded-xl border border-emerald-400/20 bg-neutral-900 px-4 py-3 text-sm font-medium text-emerald-200 shadow-xl">{toast}</div>}

      {selectedOrder && (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="admin-order-title" aria-busy={detailLoading} className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            {detailLoading && <p role="status" className="mb-3 text-xs text-emerald-200">Loading latest order details...</p>}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Order details</p>
                <h2 id="admin-order-title" className="mt-1 break-all text-lg font-bold text-white">{selectedOrder.id}</h2>
                <p className="mt-1 text-xs text-stone-400">{formatOrderDate(selectedOrder.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <button type="button" aria-label="Close order details" onClick={() => setSelectedOrder(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"><X className="h-5 w-5" aria-hidden="true" /></button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-neutral-950 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Order information</h3>
                <div className="mt-3 flex items-center gap-2">{renderStatus(selectedOrder)}</div>
                <p className="mt-3 text-xs text-stone-400">Order status is updated through the order service.</p>
              </section>
              <section className="rounded-xl border border-white/10 bg-neutral-950 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Customer</h3>
                <p className="mt-3 text-sm font-semibold text-white">{selectedOrder.customer?.name || "Not provided"}</p>
                {selectedOrder.customer?.phone && <p className="mt-1 text-xs text-stone-300">{selectedOrder.customer.phone}</p>}
                {selectedOrder.customer?.email && <p className="mt-1 break-all text-xs text-stone-400">{selectedOrder.customer.email}</p>}
              </section>
            </div>

            <section className="mt-4 rounded-xl border border-white/10 bg-neutral-950 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Order timeline</h3>
              {normalizeOrderStatus(selectedOrder) === "CANCELLED" ? (
                <ol className="mt-3 flex flex-wrap gap-3 text-xs">
                  <li className="inline-flex items-center gap-2 text-emerald-200"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /><span>Placed{getStatusTimestamp(selectedOrder, "PENDING") && <small className="ml-1 block text-stone-500">{formatOrderDate(getStatusTimestamp(selectedOrder, "PENDING"), { dateStyle: "medium", timeStyle: "short" })}</small>}</span></li>
                  <li className="inline-flex items-center gap-2 text-rose-200"><X className="h-4 w-4" aria-hidden="true" /><span>Cancelled{getStatusTimestamp(selectedOrder, "CANCELLED") && <small className="ml-1 block text-stone-500">{formatOrderDate(getStatusTimestamp(selectedOrder, "CANCELLED"), { dateStyle: "medium", timeStyle: "short" })}</small>}</span></li>
                </ol>
              ) : (
                <ol className="mt-3 grid gap-3 sm:grid-cols-4">
                  {[
                    { status: "PENDING", label: "Placed" },
                    { status: "CONFIRMED", label: "Confirmed" },
                    { status: "SHIPPED", label: "Shipped" },
                    { status: "DELIVERED", label: "Delivered" },
                  ].map(({ status, label }) => {
                    const timelineStatus = normalizeOrderStatus(selectedOrder);
                    const statusIndex = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"].indexOf(timelineStatus);
                    const index = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"].indexOf(status);
                    const complete = index <= statusIndex;
                    const timestamp = getStatusTimestamp(selectedOrder, status);
                    return <li key={status} className={`inline-flex items-start gap-2 text-xs ${complete ? "text-emerald-200" : "text-stone-600"}`}>{complete ? <CheckCircle2 className="mt-0.5 h-4 w-4" aria-hidden="true" /> : <CircleUserRound className="mt-0.5 h-4 w-4" aria-hidden="true" />}<span>{label}{timestamp && <small className="mt-1 block text-stone-500">{formatOrderDate(timestamp, { dateStyle: "medium", timeStyle: "short" })}</small>}</span></li>;
                  })}
                </ol>
              )}
            </section>

            <section className="mt-4 rounded-xl border border-white/10 bg-neutral-950 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Order items</h3>
              <div className="mt-3 divide-y divide-white/10">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-900 p-1">{item.image && <img src={item.image} alt={item.name} className="h-full w-full object-contain" />}</div>
                    <div className="min-w-0 flex-1"><p className="wrap-break-word text-xs font-medium text-white">{item.name}</p><p className="mt-1 text-[11px] text-stone-500">{item.quantity} × {money(item.price)}</p></div>
                    <p className="shrink-0 text-xs font-semibold text-white">{money(Number(item.quantity) * Number(item.price))}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs">
                <div className="flex justify-between text-stone-400"><span>Subtotal</span><span>{money(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-stone-400"><span>Shipping</span><span>{money(selectedOrder.shipping)}</span></div>
                <div className="flex justify-between text-stone-400"><span>Tax</span><span>{money(selectedOrder.tax)}</span></div>
                {selectedOrder.discount !== undefined && <div className="flex justify-between text-stone-400"><span>Discount</span><span>{money(selectedOrder.discount)}</span></div>}
                <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-white"><span>Total</span><span>{money(selectedOrder.total)}</span></div>
              </div>
            </section>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-neutral-950 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Payment</h3>
                <p className="mt-3 text-sm font-medium text-white">{selectedOrder.payment?.method || "Not recorded"}</p>
                <p className="mt-1 break-all text-xs text-stone-400">Transaction: {selectedOrder.payment?.transactionId || "Not provided"}</p>
                <p className="mt-2 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-200">{getPaymentStatus(selectedOrder)}</p>
                <p className="mt-2 text-[11px] leading-5 text-stone-500">Manual payment details are for review and are not automatically verified.</p>
              </section>
              <section className="rounded-xl border border-white/10 bg-neutral-950 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Delivery address</h3>
                <p className="mt-3 text-sm font-medium text-white">{selectedOrder.customer?.name || "Not provided"}</p>
                <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-stone-300">{selectedOrder.deliveryAddress?.address}</p>
                <p className="text-xs text-stone-300">{[selectedOrder.deliveryAddress?.city, selectedOrder.deliveryAddress?.state].filter(Boolean).join(", ")} {selectedOrder.deliveryAddress?.pincode}</p>
                {selectedOrder.customer?.phone && <p className="mt-1 text-xs text-stone-400">{selectedOrder.customer.phone}</p>}
              </section>
            </div>

            {normalizeOrderStatus(selectedOrder) === "CANCELLED" && (selectedOrder.cancellation?.reason || selectedOrder.cancellation?.cancelledAt) && (
              <p className="mt-4 rounded-xl border border-rose-400/15 bg-rose-400/5 p-3 text-xs text-rose-200">Cancellation reason: {selectedOrder.cancellation?.reason || "Not provided"}{selectedOrder.cancellation?.cancelledAt && ` · ${formatOrderDate(selectedOrder.cancellation.cancelledAt, { dateStyle: "medium", timeStyle: "short" })}`}</p>
            )}

            {pendingActionId === selectedOrder.id && <p role="status" className="mt-4 text-right text-xs text-emerald-200">Updating order...</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
              {normalizeOrderStatus(selectedOrder) === "PENDING" && <button type="button" disabled={pendingActionId === selectedOrder.id} onClick={() => { setConfirmAction({ type: "accept", order: selectedOrder }); setSelectedOrder(null); }} className="min-h-10 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">Accept Order</button>}
              {normalizeOrderStatus(selectedOrder) === "CONFIRMED" && <button type="button" disabled={pendingActionId === selectedOrder.id} onClick={() => requestStatusUpdate(selectedOrder, "SHIPPED")} className="min-h-10 rounded-lg bg-indigo-500/15 px-4 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25 disabled:opacity-50">Mark as Shipped</button>}
              {normalizeOrderStatus(selectedOrder) === "SHIPPED" && <button type="button" disabled={pendingActionId === selectedOrder.id} onClick={() => requestStatusUpdate(selectedOrder, "DELIVERED")} className="min-h-10 rounded-lg bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-50">Mark as Delivered</button>}
              {["PENDING", "CONFIRMED"].includes(normalizeOrderStatus(selectedOrder)) && <button type="button" disabled={pendingActionId === selectedOrder.id} onClick={() => { setCancelReason(""); setOtherReason(""); setActionError(""); setConfirmAction({ type: "cancel", order: selectedOrder }); setSelectedOrder(null); }} className="min-h-10 rounded-lg border border-rose-400/20 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-400/10 disabled:opacity-50">Cancel Order</button>}
            </div>
          </section>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-80 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmAction(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            <h2 id="admin-confirm-title" className="text-lg font-bold text-white">{confirmAction.type === "accept" ? "Accept this order?" : confirmAction.type === "status" ? `Update order to ${confirmAction.status.toLowerCase()}?` : "Cancel Order"}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">{confirmAction.type === "accept" ? "This will move the order from Pending to Confirmed. The recorded price will not change." : confirmAction.type === "status" ? `Confirm moving this order to ${confirmAction.status.toLowerCase()}.` : "Are you sure you want to cancel this order? Please select a reason."}</p>
            {confirmAction.type === "cancel" && (
              <fieldset className="mt-4 space-y-2">
                <legend className="sr-only">Cancellation reason</legend>
                {CANCEL_REASONS.map((reason) => (
                  <label key={reason} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-xs text-stone-200 hover:bg-white/5">
                    <input type="radio" name="admin-cancel-reason" value={reason} checked={cancelReason === reason} onChange={() => { setCancelReason(reason); setActionError(""); }} className="h-4 w-4 accent-emerald-500" />
                    {reason}
                  </label>
                ))}
                {cancelReason === "Other" && <div><label htmlFor="admin-other-cancel-reason" className="mb-2 block text-xs font-semibold text-stone-200">Other cancellation reason *</label><textarea id="admin-other-cancel-reason" rows={3} value={otherReason} onChange={(event) => { setOtherReason(event.target.value); setActionError(""); }} required aria-label="Other cancellation reason" placeholder="Enter cancellation reason" className="w-full rounded-lg border border-white/10 bg-neutral-950 p-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" /></div>}
              </fieldset>
            )}
            {actionError && <p role="alert" className="mt-3 text-xs text-rose-300">{actionError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirmAction(null)} className="min-h-10 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-stone-200 hover:bg-white/5">{confirmAction.type === "accept" ? "Keep Pending" : confirmAction.type === "cancel" ? "Keep Order" : "Keep Current Status"}</button>
              <button type="button" disabled={pendingActionId === confirmAction.order.id} onClick={performAction} className={`min-h-10 rounded-lg px-4 py-2 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-60 ${confirmAction.type === "cancel" ? "bg-rose-600 hover:bg-rose-500 focus-visible:ring-rose-300" : "bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-300"}`}>
                {pendingActionId === confirmAction.order.id ? "Saving..." : confirmAction.type === "accept" ? "Accept Order" : confirmAction.type === "status" ? "Confirm Update" : "Confirm Cancellation"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;