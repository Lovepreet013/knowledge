import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AtSign, KeyRound, Lock, Mail, User } from "lucide-react";
import api, { setAuthTokens } from "../../lib/api";
import { AlertBox, labelCls } from "../../components/ui";
import AuthLayout from "../../components/auth-layout";
import { IconInput, PasswordInput } from "../../components/form-fields";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <AuthLayout
      aside={{
        headline: "Built for teams who think deeply.",
        sub: "Turn your documents into answers.",
      }}
    >
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
          <IconInput
            id="register-fullname"
            icon={<User className="h-5 w-5" />}
            placeholder="e.g. Priya Sharma"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="register-email" className={labelCls}>
            Work email
          </label>
          <IconInput
            id="register-email"
            icon={<Mail className="h-5 w-5" />}
            placeholder="you@company.com"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="register-username" className={labelCls}>
            Username
          </label>
          <IconInput
            id="register-username"
            icon={<AtSign className="h-5 w-5" />}
            placeholder="Choose a username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="register-password" className={labelCls}>
            Password
          </label>
          <PasswordInput
            id="register-password"
            icon={<Lock className="h-5 w-5" />}
            placeholder="Create a password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={error ? true : undefined}
          />
          <p className="mt-2 text-sm leading-5 font-normal text-[#666666]">
            Must be at least 8 characters with a number and a letter.
          </p>
        </div>
        <div>
          <label htmlFor="register-invite" className={labelCls}>
            Invite code
          </label>
          <IconInput
            id="register-invite"
            icon={<KeyRound className="h-5 w-5" />}
            placeholder="Enter your invite code"
            autoComplete="off"
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
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
    </AuthLayout>
  );
}
