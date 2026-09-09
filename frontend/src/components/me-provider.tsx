import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import api from "../lib/api";

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
  const lastToken = useRef<string | null | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token === lastToken.current) return;
    lastToken.current = token;
    if (!token) {
      setMe(null);
      return;
    }
    let cancelled = false;
    api
      .get("/auth/me/")
      .then((res) => {
        if (!cancelled) setMe(res.data);
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
