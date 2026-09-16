import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, User } from "lucide-react";
import api, { setAuthTokens } from "../../lib/api";
import { AlertBox, Hairline } from "../../components/ui";
import { labelCls } from "../../components/ui";
import AuthLayout from "../../components/auth-layout";
import { GoogleMark, IconInput, PasswordInput } from "../../components/form-fields";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{
    area: "forgot" | "google";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) return;

    setError("");
    setNotice(null);
    setSubmitting(true);

    try {
      const res = await api.post("/auth/login/", {
        username,
        password,
      });

      setAuthTokens(res.data.access, res.data.refresh, remember);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      aside={{
        headline: "Company knowledge, when you need it.",
        sub: "Secure. Isolated. Cited.",
      }}
    >
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
          <IconInput
            id="login-username"
            icon={<User className="h-5 w-5" />}
            placeholder="e.g. priya or you@company.com"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={error ? true : undefined}
          />
        </div>

        <div>
          <label htmlFor="login-password" className={labelCls}>
            Password
          </label>
          <PasswordInput
            id="login-password"
            icon={<Lock className="h-5 w-5" />}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={error ? true : undefined}
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

        <div className="flex min-w-0 items-center justify-between gap-4">
          <label
            htmlFor="login-remember"
            className="flex min-w-0 min-h-[44px] cursor-pointer items-center gap-3 text-sm leading-5 font-normal text-black"
          >
            <input
              id="login-remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-5 w-5 shrink-0 cursor-pointer accent-black"
            />
            <span className="min-w-0">Remember me</span>
          </label>

          <button
            type="button"
            onClick={() =>
              setNotice({
                area: "forgot",
                text: "Password resets aren't available yet — ask your company admin to help you sign in.",
              })
            }
            className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center text-sm leading-5 font-normal text-black underline decoration-[#972121] underline-offset-4 transition hover:text-[#972121]"
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

      <div className="mt-8 min-w-0 space-y-4">
        <div
          className="flex min-w-0 items-center gap-4"
          aria-hidden="true"
        >
          <Hairline className="min-w-0 flex-1" />
          <span className="font-display shrink-0 text-xs leading-4 font-medium tracking-[0.12em] text-[#666666]">
            OR
          </span>
          <Hairline className="min-w-0 flex-1" />
        </div>

        <button
          type="button"
          onClick={() =>
            setNotice({
              area: "google",
              text: "Google sign-in isn't available yet — log in with your username and password.",
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
    </AuthLayout>
  );
}