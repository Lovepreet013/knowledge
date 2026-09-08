import { useState } from "react";
import api from "../../lib/api";

export default function PromotePage() {
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handlePromote = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setResult("");
    try {
      const res = await api.post(`/companies/promote/${userId}/`);
      setResult(`${res.data.username} is now ${res.data.role}`);
    } catch {
      setError("Failed to promote user. Check the user ID and your permissions.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Promote User to Company Admin</h2>
      <form onSubmit={handlePromote}>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <button type="submit">Promote</button>
        {result && <p style={{ color: "green" }}>{result}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}