import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const configurationError = new Error(
  "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env to enable live authentication.",
);

const unavailableAuth = {
  getSession: async () => ({ data: { session: null }, error: configurationError }),
  signInWithPassword: async () => ({ data: null, error: configurationError }),
  signUp: async () => ({ data: null, error: configurationError }),
  signOut: async () => ({ error: null }),
  resetPasswordForEmail: async () => ({ error: configurationError }),
  onAuthStateChange: () => ({
    data: { subscription: { unsubscribe: () => {} } },
  }),
};

// A missing local `.env` should not blank the entire storefront. Auth flows
// receive a clear configuration error while the local/demo experience remains usable.
export const supabase =
  url && publishableKey ? createClient(url, publishableKey) : { auth: unavailableAuth };
