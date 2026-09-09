import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Box } from "lucide-react";
import api from "../../lib/api";

const inputCls =
  "w-full min-h-[44px] rounded-lg border border-[#CCCCCC] bg-white px-4 py-3 text-base leading-[22.4px] font-normal text-black placeholder:text-[#999999] hover:border-[#999999] focus:border-black focus:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:border-[#E0E0E0] disabled:bg-[#F5F5F5]";

const labelCls = "mb-2 block font-display text-sm leading-[18.2px] font-normal text-black";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await api.post("/auth/login/", { username, password });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen min-h-svh flex-col bg-white font-sans text-black antialiased">
      <div className="sticky top-0 z-20 bg-white shadow-[0px_1px_0px_0px_rgba(0,0,0,0.16)]">
        <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Company Knowledge AI home">
            <Box className="h-7 w-7 text-black" aria-hidden="true" />
            <span className="font-display text-base leading-[23.2px] font-medium tracking-[-0.02em] text-black">
              Company Knowledge AI
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-black bg-transparent px-4 py-2 text-sm leading-[18.4px] font-normal text-black transition hover:bg-[#F5F5F5]"
          >
            Back to home
          </Link>
        </header>
      </div>

      <main className="flex flex-1 flex-col">
        <section aria-label="Log in" className="flex flex-1 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto my-auto w-full max-w-lg px-4 py-10 sm:px-5"
          >
            <div className="rounded-xl border border-[#E0E0E0] bg-white">
              <div className="border-b border-[#E0E0E0] px-6 py-6">
                <p className="font-display inline-block rounded-full bg-[#EDE9FE] px-3 py-1 text-sm leading-[18.2px] font-medium text-[#7C3AED]">
                  Welcome back
                </p>
                <h1 className="font-display mt-4 text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black">
                  Log in
                </h1>
                <p className="mt-3 text-lg leading-[25.2px] font-normal text-black">
                  Access your tenant-isolated workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
                <div>
                  <label htmlFor="login-username" className={labelCls}>
                    Username
                  </label>
                  <input
                    id="login-username"
                    placeholder="e.g. priya"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    aria-invalid={error ? true : undefined}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className={labelCls}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={error ? true : undefined}
                      className={`${inputCls} pr-20`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute top-1/2 right-4 min-h-[44px] -translate-y-1/2 bg-transparent px-1 text-base leading-[22.4px] font-normal text-black transition hover:text-[#972121] hover:underline hover:decoration-[#972121] hover:underline-offset-4"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-[#972121] bg-white px-4 py-3 text-base leading-[22.4px] font-normal text-[#972121]"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[46px] w-full items-center justify-center rounded-lg bg-black px-[22px] py-3 text-base leading-[18.4px] font-normal text-white transition hover:opacity-85 active:bg-[#1A1A1A] disabled:cursor-not-allowed disabled:bg-[#CCCCCC] disabled:text-[#999999] disabled:hover:opacity-100"
                >
                  {submitting ? "Logging in…" : "Log in"}
                </button>
              </form>

              <p className="rounded-b-xl border-t border-[#E0E0E0] bg-[#F5F5F5] px-6 py-4 text-center text-base leading-[23.2px] font-normal text-black">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-normal text-black underline decoration-[#972121] underline-offset-4 transition hover:text-[#972121]"
                >
                  Register
                </Link>
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
