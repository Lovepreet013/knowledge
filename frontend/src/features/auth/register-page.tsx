import { useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // Step 1: create the account
      await api.post("/auth/register/", {
        email,
        username,
        password,
        invite_code: inviteCode,
      });

      // Step 2: immediately log in with the same credentials
      const loginRes = await api.post("/auth/login/", { username, password });
      localStorage.setItem("access_token", loginRes.data.access);
      localStorage.setItem("refresh_token", loginRes.data.refresh);

      // Step 3: now we actually have a token — safe to go to the dashboard
      navigate("/dashboard");
    } catch (err: any) {
      const data = err.response?.data;
      const firstError = data
        ? (Object.values(data)[0] as string[])?.[0]
        : null;
      setError(firstError || "Registration failed. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "80px auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
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
        <input
          placeholder="Invite Code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <button type="submit">Register</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/">Log in</Link>
      </p>
    </div>
  );
}