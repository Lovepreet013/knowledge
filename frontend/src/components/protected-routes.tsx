import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import api from "../lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];   // for role-specific routes (companies, promote, company-users)
  requireCompany?: boolean;  // for routes any company member can use (documents, chat)
}

export default function ProtectedRoute({ children, allowedRoles, requireCompany }: ProtectedRouteProps) {
  const token = localStorage.getItem("access_token");
  const [me, setMe] = useState<{ role: string; company: number | null } | null>(null);
  const [loading, setLoading] = useState(!!(allowedRoles || requireCompany));

  useEffect(() => {
    if (!token || (!allowedRoles && !requireCompany)) return;
    api.get("/auth/me/").then((res) => {
      setMe(res.data);
      setLoading(false);
    });
  }, [token, allowedRoles, requireCompany]);

  if (!token) return <Navigate to="/" replace />;
  if (!allowedRoles && !requireCompany) return <>{children}</>;
  if (loading) return <p>Loading...</p>;

  if (allowedRoles && me && !allowedRoles.includes(me.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (requireCompany && me && me.company === null) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}