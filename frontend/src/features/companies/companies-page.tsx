import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Company {
  id: number;
  name: string;
  slug: string;
  invite_code: string;
  is_active: boolean;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  const loadCompanies = async () => {
    const res = await api.get("/companies/");
    setCompanies(res.data);
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreate = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/companies/", { name, slug });
      setName("");
      setSlug("");
      loadCompanies();
    } catch (err: any) {
      const data = err.response?.data;
      const firstError = data ? (Object.values(data)[0] as string[])?.[0] : null;
      setError(firstError || "Failed to create company.");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2>Companies</h2>

      <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <input
          placeholder="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <button type="submit">Create Company</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {companies.map((c) => (
          <li key={c.id} style={{ marginBottom: 12, borderBottom: "1px solid #ccc", paddingBottom: 8 }}>
            <strong>{c.name}</strong> ({c.slug})
            <br />
            Invite code: <code>{c.invite_code}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}