import React from "react";
import {
  BellRing,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Info,
  PackageCheck,
  ShoppingBag,
  TriangleAlert,
  X,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const TYPE_STYLES = {
  order: { Icon: ShoppingBag, accent: "text-sky-300", ring: "ring-sky-400/30" },
  appointment: {
    Icon: CalendarCheck,
    accent: "text-violet-300",
    ring: "ring-violet-400/30",
  },
  payment: {
    Icon: CreditCard,
    accent: "text-amber-300",
    ring: "ring-amber-400/30",
  },
  product: {
    Icon: PackageCheck,
    accent: "text-teal-300",
    ring: "ring-teal-400/30",
  },
  success: {
    Icon: CheckCircle2,
    accent: "text-emerald-300",
    ring: "ring-emerald-400/30",
  },
  warning: {
    Icon: TriangleAlert,
    accent: "text-rose-300",
    ring: "ring-rose-400/30",
  },
  info: { Icon: Info, accent: "text-stone-300", ring: "ring-white/15" },
};

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const NotificationToasts = () => {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:left-auto sm:right-4 sm:items-end sm:px-0"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
        const { Icon } = style;
        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-neutral-900/95 px-4 py-3 shadow-2xl shadow-black/50 ring-1 backdrop-blur-md transition-all duration-300 ${style.ring}`}
          >
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 ${style.accent}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <BellRing
                  className={`h-3.5 w-3.5 shrink-0 ${style.accent}`}
                  aria-hidden="true"
                />
                <p className="truncate text-sm font-semibold text-white">
                  {toast.title}
                </p>
              </div>
              {toast.message && (
                <p className="mt-1 text-xs leading-5 break-words text-stone-400">
                  {toast.message}
                </p>
              )}
              <p className="mt-1 text-[10px] tracking-wide text-stone-600 uppercase">
                {formatTime(toast.createdAt)}
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
              className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-stone-500 transition hover:bg-white/5 hover:text-stone-200 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationToasts;
