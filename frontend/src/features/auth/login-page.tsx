import { useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../../lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login/", { username, password });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password.");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "80px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <button type="submit">Log in</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <p style={{ marginTop: 12 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}