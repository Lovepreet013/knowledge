import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Me {
  id: number;
  email: string;
  username: string;
  role: string;
  company: number | null;
}

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    api.get("/auth/me/").then((res) => setMe(res.data));
  }, []);

  if (!me) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Welcome, {me.username}</h2>
      <p>Role: {me.role}</p>
      <p>Company ID: {me.company ?? "none"}</p>
    </div>
  );
}