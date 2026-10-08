import React from "react";
import { ShieldAlert } from "lucide-react";

const AdminAuthGuard = ({ children }) => (
  <>
    <div className="border-b border-amber-400/20 bg-amber-400/5 px-4 py-3 text-amber-100 sm:px-6">
      <div className="mx-auto flex max-w-[1600px] items-start gap-3 text-xs leading-5 sm:text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
        <p>
          Development mode: this admin panel uses browser storage and has no authentication. It is not secure for production. Protect admin APIs with server-verified identity, roles, and authorization before connecting a backend.
        </p>
      </div>
    </div>
    {children}
  </>
);

export default AdminAuthGuard;