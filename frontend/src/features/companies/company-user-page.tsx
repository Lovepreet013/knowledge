import { useEffect, useState } from "react";
import api from "../../lib/api";

interface CompanyUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function CompanyUsersPage() {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const res = await api.get("/companies/users/");
      setUsers(res.data);
    } catch {
      setError("Failed to load users. You may not have permission.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleActive = async (user: CompanyUser) => {
    try {
      await api.patch(`/companies/users/${user.id}/`, { is_active: !user.is_active });
      loadUsers();
    } catch {
      alert("Failed to update user.");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2>Company Users</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {users.map((u) => (
          <li key={u.id} style={{ marginBottom: 12, borderBottom: "1px solid #ccc", paddingBottom: 8 }}>
            <strong>{u.username}</strong> ({u.email}) — {u.role}
            <br />
            Status: {u.is_active ? "Active" : "Inactive"}
            <button onClick={() => toggleActive(u)} style={{ marginLeft: 12 }}>
              {u.is_active ? "Deactivate" : "Activate"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}