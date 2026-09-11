import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Box } from "lucide-react";
import api from "../../lib/api";

const inputCls =
  "w-full min-h-[44px] rounded-lg border border-[#CCCCCC] bg-white px-4 py-3 text-base leading-[22.4px] font-normal text-black placeholder:text-[#999999] hover:border-[#999999] focus:border-[#CCCCCC] focus:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:border-[#E0E0E0] disabled:bg-[#F5F5F5]";

const labelCls = "mb-2 block font-display text-sm leading-[18.2px] font-normal text-black";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="flex min-h-screen min-h-svh flex-col bg-white font-sans text-black antialiased">
      <div className="sticky top-0 z-20 bg-white shadow-[0px_1px_0px_0px_rgba(0,0,0,0.16)]">
        <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Knowledge AI home">
            <Box className="h-7 w-7 text-black" aria-hidden="true" />
            <span className="font-display text-base leading-[23.2px] font-medium tracking-[-0.02em] text-black">
              Knowledge AI
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
        <section aria-label="Register" className="grid flex-1 lg:grid-cols-2">
          <div className="my-auto flex w-full flex-col justify-center px-4 py-10 sm:px-5 lg:px-0 lg:py-14 lg:pr-12 lg:pl-[max(2rem,calc((100vw-75rem)/2+2rem))]">
            <div className="w-full max-w-md">
            <p className="font-display inline-block rounded-full bg-black px-3 py-1 text-sm leading-[18.2px] font-medium text-white">
              Invite only
            </p>
            <h1 className="font-display mt-4 text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black">
              Register
            </h1>
            <p className="mt-3 text-lg leading-[25.2px] font-normal text-black">
              Join your company workspace with an invite code.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="register-email" className={labelCls}>
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
                  <label htmlFor="register-username" className={labelCls}>
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
                  <label htmlFor="register-password" className={labelCls}>
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
                <div>
                  <label htmlFor="register-invite" className={labelCls}>
                    <span className="flex items-center gap-2">
                      Invite code
                    </span>
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
                  {submitting ? "Creating account…" : "Register"}
                </button>
              </form>

              <p className="mt-8 text-center text-base leading-[23.2px] font-normal text-black">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-normal text-black underline decoration-[#972121] underline-offset-4 transition hover:text-[#972121]"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
          <aside aria-label="Product preview" className="relative hidden overflow-hidden lg:block">
            <img
              src="/login.webp"
              alt="Misty lakeside mountains in the style of a Japanese woodblock print"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent" />
            <div className="absolute top-1/2 right-8 left-8 -translate-y-1/2 -rotate-2 rounded-xl border border-[#E0E0E0] bg-white/85 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-300 hover:rotate-0">
              <p className="font-display mt-4 text-lg leading-[25.2px] font-medium text-black">
                “One invite code onboarded our whole team into the right tenant.”
              </p>
              <p className="mt-2 text-sm leading-5 font-normal text-[#666666]">
                Daniel · Operations lead, Globex
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
