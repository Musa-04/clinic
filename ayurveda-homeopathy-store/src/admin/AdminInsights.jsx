import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  IndianRupee,
  Mail,
  Menu,
  MessageSquareQuote,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import { adminOrderService, ORDER_STATUSES, normalizeOrderStatus } from "../services/adminOrderService";
import { normalizePaymentStatus } from "../utils/orderStorage";
import { getAppointments } from "../utils/appointmentStorage";
import testimonials from "../data/testimonials";

const SECTION_CONTENT = {
  dashboard: {
    title: "Dashboard",
    description: "A current snapshot of orders, customers, and clinic feedback.",
  },
  analytics: {
    title: "Analytics",
    description: "Explore order status, delivered revenue, and payment activity.",
  },
  customers: {
    title: "Customers",
    description: "Customer profiles and order summaries derived from store orders.",
  },
  reviews: {
    title: "Clinic testimonials",
    description: "Read-only testimonials published in the clinic website content.",
  },
};

const money = (amount) => `₹${(Number(amount) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const dateLabel = (value) => {
  const date = safeDate(value);
  return date ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date unavailable";
};
const orderTotal = (order) => {
  const total = Number(order?.total ?? order?.totalAmount ?? 0);
  return Number.isFinite(total) ? total : 0;
};
const paymentMethod = (order) => {
  const method = String(order?.payment?.method || "").trim();
  return method || "Not recorded";
};
const orderIdentity = (order) => {
  const email = String(order?.customer?.email || "").trim().toLowerCase();
  const phone = String(order?.customer?.phone || "").replace(/\D/g, "");
  return email ? `email:${email}` : phone ? `phone:${phone}` : null;
};
const Panel = ({ children, className = "" }) => (
  <section className={`min-w-0 rounded-2xl border border-white/[0.07] bg-neutral-900/80 p-4 shadow-sm shadow-black/20 sm:p-5 ${className}`}>
    {children}
  </section>
);

const SectionHeading = ({ eyebrow, title, detail, action }) => (
  <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
    <div className="min-w-0">
      {eyebrow && <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">{eyebrow}</p>}
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">{title}</h2>
      {detail && <p className="mt-1 text-xs leading-5 text-stone-500">{detail}</p>}
    </div>
    {action}
  </div>
);

const MetricCard = ({ label, value, Icon, hint, tint = "text-white" }) => (
  <article className="min-w-0 rounded-2xl border border-white/[0.07] bg-linear-to-b from-neutral-900 to-neutral-900/70 p-4 shadow-sm shadow-black/20 sm:p-5">
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-medium text-stone-400">{label}</p>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
        <Icon className={`h-4 w-4 ${tint}`} aria-hidden="true" />
      </span>
    </div>
    <p className={`mt-3 break-words text-2xl font-bold tracking-tight ${tint}`}>{value}</p>
    {hint && <p className="mt-1 text-[11px] leading-4 text-stone-500">{hint}</p>}
  </article>
);

const EmptyState = ({ title, description }) => (
  <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
    <ShoppingBag className="mx-auto h-7 w-7 text-stone-600" aria-hidden="true" />
    <p className="mt-3 text-sm font-medium text-stone-300">{title}</p>
    <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-stone-500">{description}</p>
  </div>
);

const AdminInsights = ({ section = "dashboard", onNavigate, onOpenNav }) => {
  const activeSection = SECTION_CONTENT[section] ? section : "dashboard";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [appointmentError, setAppointmentError] = useState("");

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const loadedOrders = await adminOrderService.getOrders();
      if (!Array.isArray(loadedOrders)) throw new Error("Orders returned an unexpected format.");
      setOrders(loadedOrders);
      setLoadError("");
    } catch {
      setLoadError("Orders could not be loaded. Check the available order data and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const refreshAppointments = () => {
      try {
        const records = getAppointments();
        setAppointments([...records].sort(
          (left, right) => (safeDate(right.createdAt)?.getTime() || 0) - (safeDate(left.createdAt)?.getTime() || 0),
        ));
        setAppointmentError("");
      } catch {
        setAppointmentError("Appointment requests could not be loaded from browser storage.");
      }
    };
    refreshAppointments();
    const onStorage = (event) => {
      if (event.key === null || event.key === "maliks_appointments") refreshAppointments();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("maliks-appointments-updated", refreshAppointments);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("maliks-appointments-updated", refreshAppointments);
    };
  }, [loadOrders]);

  const customers = useMemo(() => {
    const unique = new Map();
    orders.forEach((order) => {
      const identity = orderIdentity(order);
      if (!identity) return;
      const existing = unique.get(identity);
      if (existing) {
        existing.orders.push(order);
      } else {
        unique.set(identity, { identity, customer: order.customer || {}, orders: [order] });
      }
    });

    return [...unique.values()].map((entry) => {
      const sortedOrders = [...entry.orders].sort((a, b) =>
        (safeDate(b.createdAt)?.getTime() || 0) - (safeDate(a.createdAt)?.getTime() || 0),
      );
      const activeOrders = sortedOrders.filter((order) => normalizeOrderStatus(order) !== "CANCELLED");
      return {
        ...entry,
        orders: sortedOrders,
        latestOrder: sortedOrders[0],
        activeOrderCount: activeOrders.length,
        lifetimeValue: activeOrders.reduce((sum, order) => sum + orderTotal(order), 0),
      };
    }).sort((a, b) => (safeDate(b.latestOrder?.createdAt)?.getTime() || 0) - (safeDate(a.latestOrder?.createdAt)?.getTime() || 0));
  }, [orders]);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const orderDate = safeDate(order.createdAt);
    if (!orderDate) return !dateFrom && !dateTo;
    const day = [
      orderDate.getFullYear(),
      String(orderDate.getMonth() + 1).padStart(2, "0"),
      String(orderDate.getDate()).padStart(2, "0"),
    ].join("-");
    return (!dateFrom || day >= dateFrom) && (!dateTo || day <= dateTo);
  }), [orders, dateFrom, dateTo]);

  const metrics = useMemo(() => {
    const statusCounts = ORDER_STATUSES.reduce((counts, status) => {
      counts[status] = filteredOrders.filter((order) => normalizeOrderStatus(order) === status).length;
      return counts;
    }, {});
    const deliveredOrders = filteredOrders.filter((order) => normalizeOrderStatus(order) === "DELIVERED");
    const revenue = deliveredOrders.reduce((sum, order) => sum + orderTotal(order), 0);
    const paymentCounts = new Map();
    filteredOrders.forEach((order) => {
      const method = paymentMethod(order);
      const summary = paymentCounts.get(method) || { count: 0, verified: 0, pending: 0, failed: 0 };
      summary.count += 1;
      const status = normalizePaymentStatus(order.payment?.status);
      if (status === "VERIFIED") summary.verified += 1;
      else if (status === "FAILED") summary.failed += 1;
      else summary.pending += 1;
      paymentCounts.set(method, summary);
    });
    return { statusCounts, revenue, deliveredCount: deliveredOrders.length, paymentCounts: [...paymentCounts.entries()].sort((a, b) => b[1].count - a[1].count) };
  }, [filteredOrders]);

  const monthlyRevenue = useMemo(() => {
    const monthly = new Map();
    filteredOrders.forEach((order) => {
      if (normalizeOrderStatus(order) !== "DELIVERED") return;
      const date = safeDate(order.createdAt);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const bucket = monthly.get(key) || { key, label: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }), revenue: 0, orders: 0 };
      bucket.revenue += orderTotal(order);
      bucket.orders += 1;
      monthly.set(key, bucket);
    });
    return [...monthly.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-6);
  }, [filteredOrders]);

  const visibleCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter(({ customer, orders: customerOrders }) =>
      [customer.name, customer.email, customer.phone, ...customerOrders.map((order) => order.id)]
        .some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [customers, customerSearch]);

  const pageContent = SECTION_CONTENT[activeSection];
  const maxMonthlyRevenue = Math.max(1, ...monthlyRevenue.map((month) => month.revenue));
  const customerCount = customers.length;
  const totalOrders = orders.length;
  const allTimeDeliveredRevenue = orders
    .filter((order) => normalizeOrderStatus(order) === "DELIVERED")
    .reduce((sum, order) => sum + orderTotal(order), 0);

  return (
    <div className="min-h-full min-w-0 bg-[#0b0d0c] text-stone-100">
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#0b0d0c]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.25rem] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open admin navigation" onClick={onOpenNav} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-stone-300 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 lg:hidden"><Menu className="h-5 w-5" aria-hidden="true" /></button>
            <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-stone-500">Admin <span className="px-1 text-stone-700">/</span> {pageContent.title}</p>
            <h1 className="truncate text-sm font-semibold tracking-tight text-white">{pageContent.title}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.("/admin/orders")}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 text-xs font-semibold text-stone-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.06] hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Back to orders</span>
              <span className="sm:hidden">Orders</span>
            </button>
            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={loading || refreshing}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 text-xs font-semibold text-stone-300 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">Malik's Polyclinic <span className="text-stone-600">/</span> Insights</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{pageContent.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">{pageContent.description}</p>
        </div>

        {loadError && (
          <div role="alert" className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
              <p className="text-sm leading-5 text-rose-100">{loadError}</p>
            </div>
            <button type="button" onClick={() => loadOrders()} className="w-fit rounded-lg border border-rose-200/15 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-200/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div role="status" className="rounded-2xl border border-white/[0.07] bg-neutral-900/80 px-5 py-14 text-center">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-300" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-stone-300">Loading order insights…</p>
            <span className="sr-only">Loading orders</span>
          </div>
        ) : activeSection === "reviews" ? (
          <div>
            <Panel>
              <SectionHeading
                eyebrow="Read-only website content"
                title="Clinic testimonials"
                detail="These are the testimonials currently included in the clinic website content. This screen does not collect, approve, or moderate customer reviews."
                action={<span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-3 py-1.5 text-[11px] font-medium text-emerald-100"><MessageSquareQuote className="h-3.5 w-3.5" aria-hidden="true" /> {testimonials.length} published items</span>}
              />
              {testimonials.length ? (
                <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {testimonials.map((testimonial) => (
                    <article key={testimonial.id} className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5">
                      <div className="flex items-center gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
                        {Array.from({ length: Math.max(0, Math.min(5, Number(testimonial.rating) || 0)) }, (_, index) => (
                          <Star key={index} className="h-4 w-4 fill-amber-300 text-amber-300" aria-hidden="true" />
                        ))}
                        <span className="ml-1 text-xs font-medium text-amber-100">{testimonial.rating}/5</span>
                      </div>
                      <blockquote className="mt-4 break-words text-sm leading-6 text-stone-300">“{testimonial.review}”</blockquote>
                      <div className="mt-5 border-t border-white/[0.07] pt-4">
                        <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                        {testimonial.location && <p className="mt-1 text-xs text-stone-500">{testimonial.location}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : <EmptyState title="No testimonials in the website content" description="There are no read-only clinic testimonials to display." />}
            </Panel>
          </div>
        ) : activeSection === "customers" ? (
          <div className="space-y-5">
            <section aria-label="Customer summaries" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MetricCard label="Identifiable customers" value={customerCount} Icon={Users} hint="Unique email address or phone number" tint="text-emerald-100" />
              <MetricCard label="Orders in records" value={totalOrders} Icon={ShoppingBag} hint="Includes every recorded order status" />
              <MetricCard label="Delivered order value" value={money(allTimeDeliveredRevenue)} Icon={IndianRupee} hint="Summed from delivered orders only" tint="text-emerald-100" />
            </section>
            <Panel>
              <SectionHeading eyebrow="Order-derived profiles" title="Customers" detail="Customers are grouped by email address, or by phone when no email is present. Records without either contact are not identifiable here." />
              <label className="relative mb-4 block max-w-xl">
                <span className="sr-only">Search customers by name, email, phone, or order ID</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
                <input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Search name, email, phone, or order ID" className="min-h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white outline-none placeholder:text-stone-600 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10" />
              </label>
              {visibleCustomers.length ? (
                <div className="space-y-3">
                  {visibleCustomers.map(({ identity, customer, orders: customerOrders, latestOrder, activeOrderCount, lifetimeValue }) => (
                    <article key={identity} className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <div className="flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-semibold text-white">{customer.name || "Customer"}</h3>
                          <div className="mt-2 flex min-w-0 flex-col gap-1.5 text-xs text-stone-400 sm:flex-row sm:flex-wrap sm:gap-x-4">
                            {customer.email && <span className="flex min-w-0 items-center gap-1.5 break-all"><Mail className="h-3.5 w-3.5 shrink-0 text-stone-500" aria-hidden="true" />{customer.email}</span>}
                            {customer.phone && <span>{customer.phone}</span>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-xs sm:min-w-[17rem]">
                          <span className="text-stone-500">Recorded orders</span><span className="text-right font-medium text-stone-200">{customerOrders.length}</span>
                          <span className="text-stone-500">Not cancelled</span><span className="text-right font-medium text-stone-200">{activeOrderCount}</span>
                          <span className="text-stone-500">Order value*</span><span className="text-right font-semibold text-emerald-100">{money(lifetimeValue)}</span>
                          <span className="text-stone-500">Most recent</span><span className="text-right text-stone-300">{dateLabel(latestOrder?.createdAt)}</span>
                        </div>
                      </div>
                      <div className="mt-4 border-t border-white/[0.07] pt-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Recent order summary</p>
                        <div className="flex flex-wrap gap-2">
                          {customerOrders.slice(0, 4).map((order) => (
                            <span key={order.id || `${identity}-${order.createdAt}`} className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-white/[0.07] bg-black/20 px-2.5 py-1.5 text-[11px] text-stone-300">
                              <span className="max-w-[9rem] truncate">{order.id || "Order"}</span>
                              <span className="text-stone-600">·</span>
                              <span>{normalizeOrderStatus(order)}</span>
                              <span className="text-stone-600">·</span>
                              <span>{money(orderTotal(order))}</span>
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-[10px] text-stone-600">*Not-cancelled order value, not a payment reconciliation.</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <EmptyState title={customerSearch ? "No matching customers" : "No identifiable customers yet"} description={customerSearch ? "Try another name, contact detail, or order ID." : "Customer summaries will appear when orders include an email address or phone number."} />}
            </Panel>
          </div>
        ) : activeSection === "analytics" ? (
          <div className="space-y-5">
            <Panel>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">Optional date filter</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Order activity</h2>
                  <p className="mt-1 text-xs leading-5 text-stone-500">Filters by order creation date. Clear dates to include all available orders.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:w-auto">
                  <label className="min-w-0">
                    <span className="mb-1 block text-[10px] font-medium text-stone-500">From</span>
                    <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => setDateFrom(event.target.value)} className="min-h-10 w-full rounded-lg border border-white/10 bg-black/20 px-2 text-xs text-stone-200 outline-none focus:border-emerald-400/40 sm:px-3" />
                  </label>
                  <label className="min-w-0">
                    <span className="mb-1 block text-[10px] font-medium text-stone-500">To</span>
                    <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} className="min-h-10 w-full rounded-lg border border-white/10 bg-black/20 px-2 text-xs text-stone-200 outline-none focus:border-emerald-400/40 sm:px-3" />
                  </label>
                </div>
              </div>
            </Panel>
            <section aria-label="Analytics metrics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricCard label="Orders in range" value={filteredOrders.length} Icon={ShoppingBag} hint="Based on order creation date" />
              <MetricCard label="Delivered revenue" value={money(metrics.revenue)} Icon={IndianRupee} hint="Total of delivered order values" tint="text-emerald-100" />
              <MetricCard label="Delivered orders" value={metrics.deliveredCount} Icon={PackageCheck} hint="Revenue uses these orders only" tint="text-emerald-100" />
              <MetricCard label="Identifiable customers" value={customerCount} Icon={Users} hint="All-time unique email / phone" tint="text-sky-100" />
            </section>
            <div className="grid min-w-0 gap-5 xl:grid-cols-2">
              <Panel>
                <SectionHeading eyebrow="Fulfillment" title="Orders by status" detail="Status counts for the selected date range." />
                <div className="space-y-4">
                  {ORDER_STATUSES.map((status) => {
                    const count = metrics.statusCounts[status] || 0;
                    const percent = filteredOrders.length ? (count / filteredOrders.length) * 100 : 0;
                    return <div key={status}>
                      <div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="text-stone-300">{status}</span><span className="tabular-nums text-stone-400">{count} <span className="text-stone-600">({Math.round(percent)}%)</span></span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]"><div className="h-full rounded-full bg-emerald-400/80 transition-[width]" style={{ width: `${percent}%` }} /></div>
                    </div>;
                  })}
                  {!filteredOrders.length && <p className="text-xs text-stone-500">No orders fall within this date range.</p>}
                </div>
              </Panel>
              <Panel>
                <SectionHeading eyebrow="Payment activity" title="Payment method breakdown" detail="Counts include every order; amounts are not treated as confirmed revenue." />
                {metrics.paymentCounts.length ? (
                  <div className="divide-y divide-white/[0.06]">
                    {metrics.paymentCounts.map(([method, counts]) => (
                      <div key={method} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_repeat(3,auto)]">
                        <span className="truncate text-sm font-medium text-stone-200">{method}</span>
                        <span className="text-xs text-stone-400">{counts.count} orders</span>
                        <span className="text-[11px] text-emerald-200">{counts.verified} verified</span>
                        <span className="text-[11px] text-amber-200">{counts.pending} pending · {counts.failed} failed</span>
                      </div>
                    ))}
                  </div>
                ) : <EmptyState title="No payment data in this range" description="Payment activity will appear when orders are available." />}
              </Panel>
              <Panel className="xl:col-span-2">
                <SectionHeading eyebrow="Delivered orders" title="Revenue by order month" detail="Revenue is attributed to the order creation month and includes delivered orders only." />
                {monthlyRevenue.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {monthlyRevenue.map((month) => (
                      <div key={month.key} className="min-w-0 rounded-xl border border-white/[0.06] bg-black/20 p-3">
                        <div className="flex h-28 items-end">
                          <div className="w-full rounded-t-lg bg-linear-to-t from-emerald-700/80 to-emerald-300/80" style={{ height: `${Math.max(5, (month.revenue / maxMonthlyRevenue) * 100)}%` }} title={`${money(month.revenue)} delivered revenue`} />
                        </div>
                        <p className="mt-3 truncate text-xs font-medium text-stone-300">{month.label}</p>
                        <p className="mt-1 break-words text-sm font-semibold text-emerald-100">{money(month.revenue)}</p>
                        <p className="mt-1 text-[10px] text-stone-500">{month.orders} delivered</p>
                      </div>
                    ))}
                  </div>
                ) : <EmptyState title="No delivered revenue in this range" description="Only delivered orders contribute to the revenue chart." />}
              </Panel>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <section aria-label="Dashboard metrics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricCard label="Total orders" value={totalOrders} Icon={ShoppingBag} hint="All statuses" />
              <MetricCard label="Delivered revenue" value={money(allTimeDeliveredRevenue)} Icon={IndianRupee} hint="Delivered order values only" tint="text-emerald-100" />
              <MetricCard label="Customers" value={customerCount} Icon={Users} hint="Unique email / phone" tint="text-sky-100" />
              <MetricCard label="Appointments" value={appointments.length} Icon={CalendarDays} hint="Saved appointment requests" tint="text-sky-100" />
            </section>
            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
              <Panel>
                <SectionHeading eyebrow="Store activity" title="Order status" detail="Current totals across all recorded orders." action={<a href="/admin/analytics" onClick={(event) => { event.preventDefault(); onNavigate?.("/admin/analytics"); }} className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-emerald-200 hover:text-emerald-100">View analytics <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a>} />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ORDER_STATUSES.map((status) => (
                    <div key={status} className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                      <p className="text-[10px] font-medium text-stone-500">{status}</p>
                      <p className={`mt-2 text-xl font-bold ${status === "DELIVERED" ? "text-emerald-200" : status === "CANCELLED" ? "text-rose-200" : "text-stone-100"}`}>{loading ? "—" : orders.filter((order) => normalizeOrderStatus(order) === status).length}</p>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel>
                <SectionHeading eyebrow="Published content" title="Clinic testimonials" detail="Shown as published website testimonials, not submitted or moderated reviews." action={<MessageSquareQuote className="h-4 w-4 text-emerald-300" aria-hidden="true" />} />
                <div className="space-y-3">
                  {testimonials.slice(0, 2).map((testimonial) => (
                    <blockquote key={testimonial.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                      <div className="flex items-center gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
                        {Array.from({ length: Math.max(0, Math.min(5, Number(testimonial.rating) || 0)) }, (_, index) => <Star key={index} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" aria-hidden="true" />)}
                        <span className="ml-1 text-[10px] text-amber-100">{testimonial.rating}/5</span>
                      </div>
                      <p className="mt-2 line-clamp-3 break-words text-xs leading-5 text-stone-300">“{testimonial.review}”</p>
                      <p className="mt-2 text-[11px] font-semibold text-stone-400">{testimonial.name}</p>
                    </blockquote>
                  ))}
                  <button type="button" onClick={() => onNavigate?.("/admin/reviews")} className="w-full rounded-lg border border-white/[0.07] px-3 py-2 text-xs font-semibold text-stone-300 transition hover:border-emerald-300/20 hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">View all clinic testimonials</button>
                </div>
              </Panel>
            </div>
            <Panel>
              <SectionHeading eyebrow="Clinic appointments" title="Appointment requests" detail="All requests submitted through the website form, newest first." />
              {appointmentError ? (
                <p role="alert" className="rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-3 text-sm text-rose-200">{appointmentError}</p>
              ) : appointments.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {appointments.map((appointment) => (
                    <article key={appointment.id} className="min-w-0 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0"><h3 className="break-words text-sm font-semibold text-white">{appointment.fullName}</h3><p className="mt-1 text-[11px] text-stone-500">Received {dateLabel(appointment.createdAt)}</p></div>
                        <span className="shrink-0 rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-2 py-1 text-[10px] text-emerald-200">Request</span>
                      </div>
                      <div className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-3 text-xs text-stone-400">
                        <p className="break-all">{appointment.phone}</p>
                        {appointment.email && <p className="break-all">{appointment.email}</p>}
                        <p><span className="text-stone-500">Doctor:</span> {appointment.doctor}</p>
                        <p><span className="text-stone-500">Concern:</span> {appointment.concern}</p>
                        <p><span className="text-stone-500">Preferred date:</span> {appointment.preferredDate}</p>
                        {appointment.message && <p className="break-words pt-1 leading-5">{appointment.message}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : <EmptyState title="No appointment requests yet" description="Website booking requests will appear here after customers submit the appointment form." />}
            </Panel>
            <Panel>
              <SectionHeading eyebrow="At a glance" title="Order insights" detail="All figures update from the current order records." />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                  <div><p className="text-xs text-stone-500">Delivered orders</p><p className="mt-1 text-sm font-semibold text-white">{orders.filter((order) => normalizeOrderStatus(order) === "DELIVERED").length}</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                  <Clock3 className="h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
                  <div><p className="text-xs text-stone-500">Awaiting fulfillment</p><p className="mt-1 text-sm font-semibold text-white">{orders.filter((order) => ["PENDING", "CONFIRMED", "SHIPPED"].includes(normalizeOrderStatus(order))).length}</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                  <CalendarDays className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
                  <div><p className="text-xs text-stone-500">Latest recorded order</p><p className="mt-1 text-sm font-semibold text-white">{dateLabel(orders.reduce((latest, order) => {
                    const currentDate = safeDate(order.createdAt)?.getTime() || 0;
                    return currentDate > (safeDate(latest?.createdAt)?.getTime() || 0) ? order : latest;
                  }, null)?.createdAt)}</p></div>
                </div>
              </div>
            </Panel>
          </div>
        )}
        {!loading && !loadError && activeSection !== "reviews" && !orders.length && (
          <div className="mt-5 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.03] px-4 py-3 text-xs leading-5 text-stone-400">
            No orders are recorded yet. Order-based metrics and summaries will populate when real order data is available.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInsights;
