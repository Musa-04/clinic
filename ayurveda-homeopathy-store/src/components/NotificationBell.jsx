import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  BellRing,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Info,
  PackageCheck,
  ShoppingBag,
  Trash2,
  TriangleAlert,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const TYPE_ICONS = {
  order: ShoppingBag,
  appointment: CalendarCheck,
  payment: CreditCard,
  product: PackageCheck,
  success: CheckCircle2,
  warning: TriangleAlert,
  info: Info,
};

const relativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const NotificationBell = ({ variant = "light", buttonClassName = "" }) => {
  const {
    notifications,
    unreadCount,
    soundMuted,
    toggleSound,
    markAllRead,
    clearNotifications,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const isDark = variant === "dark";

  const triggerClass = isDark
    ? `relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-stone-300 transition hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${buttonClassName}`
    : `relative flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-200/60 hover:text-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none ${buttonClassName}`;

  const badgeClass =
    "absolute -top-0.5 -right-0.5 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white/90";

  const panelClass = isDark
    ? "absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl shadow-black/50"
    : "absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-400/30";

  const titleClass = isDark ? "text-white" : "text-stone-800";
  const bodyTextClass = isDark ? "text-stone-400" : "text-stone-500";
  const dividerClass = isDark ? "border-white/8" : "border-stone-100";
  const itemTitleClass = isDark ? "text-stone-100" : "text-stone-800";
  const itemBodyClass = isDark ? "text-stone-400" : "text-stone-500";
  const iconBtnClass = isDark
    ? "flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition hover:bg-white/5 hover:text-stone-200 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
    : "flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={`Notifications${
          unreadCount > 0 ? `, ${unreadCount} unread` : ""
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => {
          setOpen((current) => !current);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className={triggerClass}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Bell className="h-5 w-5" aria-hidden="true" />
        )}
        {unreadCount > 0 && (
          <span className={badgeClass}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className={panelClass} role="dialog" aria-label="Notifications">
          <div
            className={`flex items-center justify-between gap-2 border-b ${dividerClass} px-4 py-3`}
          >
            <h3 className={`text-sm font-semibold ${titleClass}`}>
              Notifications
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSound}
                title={soundMuted ? "Enable alert sound" : "Mute alert sound"}
                aria-label={
                  soundMuted ? "Enable alert sound" : "Mute alert sound"
                }
                className={iconBtnClass}
              >
                {soundMuted ? (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={clearNotifications}
                title="Clear all"
                aria-label="Clear all notifications"
                className={iconBtnClass}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className={iconBtnClass}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`px-4 py-10 text-center text-sm ${bodyTextClass}`}>
                <Bell
                  className="mx-auto mb-2 h-6 w-6 opacity-50"
                  aria-hidden="true"
                />
                No notifications yet
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => {
                  const Icon = TYPE_ICONS[notification.type] || Info;
                  const unread = !notification.read;
                  return (
                    <li
                      key={notification.id}
                      className={`flex items-start gap-3 border-t ${dividerClass} px-4 py-3 ${
                        unread
                          ? isDark
                            ? "bg-white/[0.03]"
                            : "bg-emerald-50/40"
                          : ""
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          isDark ? "bg-white/5" : "bg-stone-100"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isDark ? "text-emerald-300" : "text-emerald-700"
                          }`}
                          aria-hidden="true"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${itemTitleClass}`}>
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p
                            className={`mt-0.5 text-xs leading-5 break-words ${itemBodyClass}`}
                          >
                            {notification.message}
                          </p>
                        )}
                        <p
                          className={`mt-1 text-[10px] tracking-wide uppercase ${
                            isDark ? "text-stone-600" : "text-stone-400"
                          }`}
                        >
                          {relativeTime(notification.createdAt)}
                        </p>
                      </div>
                      {unread && (
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400"
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
