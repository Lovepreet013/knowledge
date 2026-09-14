import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import api, { getAccessToken } from "../lib/api";
import { LoadingBlock } from "./ui";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];   // only these roles may enter (e.g. ["superadmin"])
  requireCompany?: boolean;  // true = user must belong to a company
}

interface Me {
  role: string;
  company: number | null;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const { children, allowedRoles, requireCompany } = props;

  const token = getAccessToken();
  const [me, setMe] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Do we even need to check role/company for this route?
  const mustCheckUser = allowedRoles !== undefined || requireCompany === true;

  useEffect(() => {
    // No token at all — nothing to check, we'll redirect below.
    if (!token) {
      setIsLoading(false);
      return;
    }

    // This route has no role/company restriction — just being logged in is enough.
    if (!mustCheckUser) {
      setIsLoading(false);
      return;
    }

    // Fetch the current user so we can check their role and company.
    api.get("/auth/me/").then((response) => {
      setMe(response.data);
      setIsLoading(false);
    });
  }, [token, mustCheckUser]);

  // Rule 1: must be logged in.
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Still waiting on the /me/ request — show the design-system loader.
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <LoadingBlock label="Loading…" />
      </div>
    );
  }

  // Rule 2: if this route requires specific roles, check the user's role.
  if (allowedRoles !== undefined && me !== null) {
    const roleIsAllowed = allowedRoles.includes(me.role);
    if (!roleIsAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Rule 3: if this route requires a company, check the user has one.
  if (requireCompany === true && me !== null) {
    const hasCompany = me.company !== null;
    if (!hasCompany) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Passed every check that applies — show the page.
  return <>{children}</>;
}