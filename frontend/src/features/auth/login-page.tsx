import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Box, Eye, EyeOff, Lock, User } from "lucide-react";
import api, { setAuthTokens } from "../../lib/api";
import { AlertBox, Hairline } from "../../components/ui";

const inputWithIconCls =
  "w-full min-h-[44px] rounded-lg border border-[#CCCCCC] bg-white py-3 pr-4 pl-11 text-base leading-[22.4px] font-normal text-black placeholder:text-[#999999] hover:border-[#999999] focus:border-black focus:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:border-[#E0E0E0] disabled:bg-[#F5F5F5]";

const labelCls = "mb-2 block font-display text-sm leading-[18.2px] font-normal text-black";

function GoogleMark() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ area: "forgot" | "google"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await api.post("/auth/login/", { username, password });
      setAuthTokens(res.data.access, res.data.refresh, remember);
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
          <Link to="/" className="flex items-center gap-3" aria-label="Knowledge home">
            <Box className="h-7 w-7 text-black" aria-hidden="true" />
            <span className="font-display text-base leading-[23.2px] font-medium tracking-[-0.02em] text-black">
              Knowledge
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-black bg-transparent px-4 py-2 text-sm leading-[18.4px] font-normal text-black transition hover:bg-[#F5F5F5]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </header>
      </div>

      <main className="flex flex-1 flex-col">
        <section aria-label="Log in" className="grid flex-1 lg:grid-cols-2">
          <div className="flex w-full flex-col justify-start px-4 py-10 sm:px-5 lg:px-0 lg:py-14 lg:pr-12 lg:pl-[max(2rem,calc((100vw-75rem)/2+2rem))]">
            <div className="w-full max-w-md">
              <p className="font-display inline-flex h-7 items-center rounded-full bg-[#EDE9FE] px-3 text-sm leading-[18.2px] font-medium text-[#7C3AED]">
                Welcome back
              </p>
              <h1 className="font-display mt-4 text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[36px] sm:leading-[40px]">
                Log in
              </h1>
              <p className="mt-3 text-base leading-[23.2px] font-normal text-[#666666]">
                Access your tenant-isolated workspace.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="login-username" className={labelCls}>
                    Username or email
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#666666]"
                      aria-hidden="true"
                    />
                    <input
                      id="login-username"
                      placeholder="e.g. priya or you@company.com"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      aria-invalid={error ? true : undefined}
                      className={inputWithIconCls}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="login-password" className={labelCls}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#666666]"
                      aria-hidden="true"
                    />
                    <input
                      id="login-password"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={error ? true : undefined}
                      className={`${inputWithIconCls} pr-14`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                      className="absolute top-1/2 right-2 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-black transition hover:bg-[#F5F5F5]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
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

                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="login-remember"
                    className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm leading-5 font-normal text-black"
                  >
                    <input
                      id="login-remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-5 w-5 shrink-0 cursor-pointer accent-black"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNotice({
                        area: "forgot",
                        text: "Password resets aren’t available yet — ask your company admin to help you sign in.",
                      })
                    }
                    className="inline-flex min-h-[44px] cursor-pointer items-center text-sm leading-5 font-normal text-black underline decoration-[#972121] underline-offset-4 transition hover:text-[#972121]"
                  >
                    Forgot password?
                  </button>
                </div>

                {notice?.area === "forgot" && (
                  <AlertBox tone="info">{notice.text}</AlertBox>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-black px-[22px] py-3 text-base leading-[18.4px] font-normal text-white transition hover:opacity-85 active:bg-[#1A1A1A] disabled:cursor-not-allowed disabled:bg-[#CCCCCC] disabled:text-[#999999] disabled:hover:opacity-100"
                >
                  {submitting ? "Logging in…" : "Log in"}
                </button>
              </form>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4" aria-hidden="true">
                  <Hairline className="flex-1" />
                  <span className="font-display text-xs leading-4 font-medium tracking-[0.12em] text-[#666666]">
                    OR CONTINUE WITH
                  </span>
                  <Hairline className="flex-1" />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotice({
                      area: "google",
                      text: "Google sign-in isn’t available yet — log in with your username and password.",
                    })
                  }
                  className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#E0E0E0] bg-white px-[22px] py-3 text-base leading-[18.4px] font-normal text-black transition hover:border-[#CCCCCC] hover:bg-[#F5F5F5]"
                >
                  <GoogleMark />
                  Continue with Google
                </button>

                {notice?.area === "google" && (
                  <AlertBox tone="info">{notice.text}</AlertBox>
                )}

                <p className="pt-4 text-center text-base leading-[23.2px] font-normal text-black">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="font-normal text-black underline decoration-[#972121] underline-offset-4 transition hover:text-[#972121]"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <aside aria-label="Product preview" className="relative hidden overflow-hidden lg:block">
            <img
              src="/login.webp"
              alt="Misty lakeside mountains in the style of a Japanese woodblock print"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/70 to-transparent"
            />
            <div className="absolute inset-x-0 top-0 p-8 lg:p-14">
              <span aria-hidden="true" className="flex h-7 items-center">
                <span className="block h-1 w-8 bg-black" />
              </span>
              <p className="font-display mt-4 max-w-xs text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[36px] sm:leading-[40px]">
                Company knowledge, when you need it.
              </p>
              <p className="mt-3 text-base leading-[23.2px] font-normal text-black">
                Secure. Isolated. Cited.
              </p>
            </div>
          </aside>
        </section>
      </main>

      <footer className="border-t border-[#E0E0E0] bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-8">
          <p className="text-xs leading-4 font-normal text-[#666666]">
            © 2026 Knowledge. All rights reserved.
          </p>
          <p className="flex items-center gap-6 text-xs leading-4 font-normal text-[#666666]">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
