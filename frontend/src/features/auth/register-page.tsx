import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import AppIcon from "../../components/app-icon";
import api from "../../lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);

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
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } }).response?.data as
        | Record<string, string[]>
        | undefined;
      const firstError = data ? (Object.values(data)[0] as string[])?.[0] : null;
      setError(firstError || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full border-2 border-neutral-950 bg-white px-3 py-2 text-[13px] font-medium tracking-[-0.01em] text-neutral-950 placeholder:font-medium placeholder:text-neutral-400 focus:shadow-[4px_4px_0_#0a0a0b] focus:outline-none disabled:opacity-60";

  return (
    <div className="flex min-h-screen min-h-svh flex-col bg-white font-[Inter,ui-sans-serif,system-ui] text-neutral-950 antialiased">
      <div className="shrink-0 px-4 pt-4 sm:px-6">
        <header className="mx-auto flex h-14 max-w-5xl items-center justify-between border-2 border-neutral-950 bg-white py-2 pr-2 pl-4 shadow-[6px_6px_0_#0a0a0b]">
          <Link to="/" className="flex items-center gap-2" aria-label="Company Knowledge AI home">
            <span className="grid h-7 w-7 place-items-center overflow-hidden border-2 border-neutral-950 bg-neutral-950 text-white">
              <AppIcon className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-extrabold tracking-[-0.02em] uppercase">Company Knowledge AI</span>
          </Link>
          <Link
            to="/"
            className="border-2 border-neutral-950 bg-white px-4 py-1.5 text-[13px] font-bold tracking-[-0.01em] shadow-[3px_3px_0_#0a0a0b] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0a0a0b] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            Back to home
          </Link>
        </header>
      </div>

      <main className="flex flex-1 flex-col">
        <section aria-label="Register" className="flex flex-1 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto my-auto w-full max-w-sm px-4 py-8 sm:px-0"
          >
            <div className="border-2 border-neutral-950 bg-white shadow-[6px_6px_0_#0a0a0b]">
              <div className="border-b-2 border-neutral-950 px-5 py-4">
                <p className="inline-block border-2 border-neutral-950 bg-neutral-950 px-2 py-0.5 text-[11px] font-extrabold tracking-[0.1em] text-white uppercase">
                  Invite only
                </p>
                <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.04em]">Register</h1>
                <p className="mt-1 text-[13px] font-medium tracking-[-0.01em] text-neutral-500">
                  Join your company workspace with an invite code.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 px-5 py-5">
                <div>
                  <label htmlFor="register-email" className="mb-1.5 block text-[11.5px] font-extrabold tracking-[0.08em] uppercase">
                    Email
                  </label>
                  <input
                    id="register-email"
                    placeholder="you@company.com"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="register-username" className="mb-1.5 block text-[11.5px] font-extrabold tracking-[0.08em] uppercase">
                    Username
                  </label>
                  <input
                    id="register-username"
                    placeholder="e.g. priya"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="register-password" className="mb-1.5 block text-[11.5px] font-extrabold tracking-[0.08em] uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputCls} pr-16`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute top-1/2 right-1.5 -translate-y-1/2 border-2 border-neutral-950 bg-white px-2 py-0.5 text-[10.5px] font-extrabold tracking-[0.08em] uppercase transition hover:bg-[#FFD02F]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="register-invite" className="mb-1.5 flex items-center gap-2 text-[11.5px] font-extrabold tracking-[0.08em] uppercase">
                    Invite code
                    <span className="border-2 border-neutral-950 bg-[#FFD02F] px-1.5 py-px text-[10px] tracking-[0.06em]">NEW</span>
                  </label>
                  <input
                    id="register-invite"
                    placeholder="Ask your admin for the code"
                    autoComplete="off"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {error && (
                  <p role="alert" className="border-2 border-neutral-950 bg-red-50 px-3 py-2 text-[13px] font-bold tracking-[-0.01em] text-red-700 shadow-[3px_3px_0_#0a0a0b]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full border-2 border-neutral-950 bg-neutral-950 px-6 py-2.5 text-[13.5px] font-bold tracking-[-0.01em] text-white uppercase shadow-[5px_5px_0_#a3a3a3] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#a3a3a3] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                >
                  {submitting ? "Creating account…" : "Register"}
                </button>
              </form>

              <p className="border-t-2 border-neutral-950 bg-neutral-50 px-5 py-3.5 text-center text-[13px] font-medium tracking-[-0.01em] text-neutral-600">
                Already have an account?{" "}
                <Link to="/login" className="font-extrabold text-neutral-950 underline decoration-2 underline-offset-4 hover:bg-[#FFD02F]">
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
