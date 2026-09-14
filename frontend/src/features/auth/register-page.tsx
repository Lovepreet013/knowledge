import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  AtSign,
  Box,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  User,
} from "lucide-react";
import api, { setAuthTokens } from "../../lib/api";
import { AlertBox } from "../../components/ui";

const inputWithIconCls =
  "w-full min-h-[44px] rounded-lg border border-[#CCCCCC] bg-white py-3 pr-4 pl-11 text-base leading-[22.4px] font-normal text-black placeholder:text-[#999999] hover:border-[#999999] focus:border-black focus:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:border-[#E0E0E0] disabled:bg-[#F5F5F5]";

const labelCls = "mb-2 block font-display text-sm leading-[18.2px] font-normal text-black";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
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
    if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError("Password must be at least 8 characters with a number and a letter.");
      return;
    }
    setSubmitting(true);

    try {
      const parts = fullName.trim().split(/\s+/);
      const first_name = parts[0] ?? "";
      const last_name = parts.slice(1).join(" ");

      // Step 1: create the account
      await api.post("/auth/register/", {
        email,
        username,
        password,
        invite_code: inviteCode,
        first_name,
        last_name,
      });

      // Step 2: immediately log in with the same credentials
      const loginRes = await api.post("/auth/login/", { username, password });
      setAuthTokens(loginRes.data.access, loginRes.data.refresh, true);

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
        <section aria-label="Register" className="grid flex-1 lg:grid-cols-2">
          <div className="flex w-full flex-col justify-start px-4 py-10 sm:px-5 lg:px-0 lg:py-14 lg:pr-12 lg:pl-[max(2rem,calc((100vw-75rem)/2+2rem))]">
            <div className="w-full max-w-md">
              <p className="font-display inline-flex h-7 items-center rounded-full bg-[#EDE9FE] px-3 text-sm leading-[18.2px] font-medium text-[#7C3AED]">
                Invite only
              </p>
              <h1 className="font-display mt-4 text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[36px] sm:leading-[40px]">
                Create your account
              </h1>
              <p className="mt-3 text-base leading-[23.2px] font-normal text-[#666666]">
                Join your company workspace with an invite code.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="register-fullname" className={labelCls}>
                    Full name
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#666666]"
                      aria-hidden="true"
                    />
                    <input
                      id="register-fullname"
                      placeholder="e.g. Priya Sharma"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputWithIconCls}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-email" className={labelCls}>
                    Work email
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#666666]"
                      aria-hidden="true"
                    />
                    <input
                      id="register-email"
                      placeholder="you@company.com"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputWithIconCls}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-username" className={labelCls}>
                    Username
                  </label>
                  <div className="relative">
                    <AtSign
                      className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#666666]"
                      aria-hidden="true"
                    />
                    <input
                      id="register-username"
                      placeholder="Choose a username"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={inputWithIconCls}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-password" className={labelCls}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#666666]"
                      aria-hidden="true"
                    />
                    <input
                      id="register-password"
                      placeholder="Create a password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
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
                  <p className="mt-2 text-sm leading-5 font-normal text-[#666666]">
                    Must be at least 8 characters with a number and a letter.
                  </p>
                </div>
                <div>
                  <label htmlFor="register-invite" className={labelCls}>
                    Invite code
                  </label>
                  <div className="relative">
                    <KeyRound
                      className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#666666]"
                      aria-hidden="true"
                    />
                    <input
                      id="register-invite"
                      placeholder="Enter your invite code"
                      autoComplete="off"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className={inputWithIconCls}
                    />
                  </div>
                </div>

                {error && <AlertBox>{error}</AlertBox>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-black px-[22px] py-3 text-base leading-[18.4px] font-normal text-white transition hover:opacity-85 active:bg-[#1A1A1A] disabled:cursor-not-allowed disabled:bg-[#CCCCCC] disabled:text-[#999999] disabled:hover:opacity-100"
                >
                  {submitting ? "Creating account…" : "Create account"}
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
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/70 to-transparent"
            />
            <div className="absolute inset-x-0 top-0 p-8 lg:p-14">
              <span aria-hidden="true" className="flex h-7 items-center">
                <span className="block h-1 w-8 bg-black" />
              </span>
              <p className="font-display mt-4 max-w-xs text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[36px] sm:leading-[40px]">
                Built for teams who think deeply.
              </p>
              <p className="mt-3 max-w-xs text-base leading-[23.2px] font-normal text-black">
                Turn your documents into answers.
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
