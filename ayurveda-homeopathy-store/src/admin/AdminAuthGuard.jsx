import React from "react";
import { ShieldAlert } from "lucide-react";

const AdminAuthGuard = ({ children }) => (
  <>
    <div className="border-b border-amber-300/15 bg-amber-300/[0.04] px-4 py-2 text-amber-100 sm:px-6">
      <div className="mx-auto flex max-w-[1600px] items-center gap-2.5 text-[11px] leading-5 sm:text-xs">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
        <p className="min-w-0">
          <span className="font-semibold text-amber-200">Development Mode</span>
          <span className="mx-2 text-amber-100/40" aria-hidden="true">•</span>
          Browser storage enabled · Authentication not configured
          <span className="hidden sm:inline"> · Not secure for production; protect admin APIs with server-verified identity, roles, and authorization.</span>
          <span className="sm:hidden"> · Not secure for production.</span>
        </p>
      </div>
    </div>
    {children}
  </>
);

export default AdminAuthGuard;