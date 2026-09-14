import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import api, { getAccessToken } from "../lib/api";

export interface Me {
  username: string;
  role: string;
  company: number | null;
  company_name?: string | null;
}

const MeContext = createContext<Me | null>(null);

/**
 * Fetches /auth/me/ once and keeps it alive across route changes.
 * AppShell (and its badge) remounts on every page jump, so owning the
 * fetch there caused a visible badge refresh + a wasted request each time.
 * This provider sits above <Routes>, so navigation never refetches —
 * it only refetches when the stored token actually changes (login/logout).
 */
export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  // Token that `me` was successfully loaded for. Only marked on success —
  // marking before the request (like the old lastToken guard) strands the
  // app with no user under StrictMode's mount setup→cleanup→setup cycle:
  // the first request gets cancelled and the second run bails out early.
  const fetchedFor = useRef<string | null | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      fetchedFor.current = null;
      setMe(null);
      return;
    }
    if (token === fetchedFor.current) return;
    let cancelled = false;
    api
      .get("/auth/me/")
      .then((res) => {
        if (!cancelled) {
          fetchedFor.current = token;
          setMe(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  return <MeContext.Provider value={me}>{children}</MeContext.Provider>;
}

export function useMe() {
  return useContext(MeContext);
}
