import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";
import api, { setAuthTokens } from "../../lib/api";
import { firstApiError } from "../../lib/utils";
import { AlertBox } from "../../components/ui";
import { GoogleMark } from "../../components/form-fields";
import { getAuth0Config } from "./auth0-config";

interface Auth0ButtonProps {
  /** Invite code for brand-new users. Absent on login, required on register. */
  inviteCode?: string;
  /** Storage target for the returned JWT pair (matches Remember me). */
  remember: boolean;
  /** Require inviteCode to be non-empty before opening Auth0. */
  requireInviteCode?: boolean;
  /** Show the Auth0 signup tab instead of login. */
  isSignup?: boolean;
  onSuccess: () => void;
}

/**
 * Social sign-in via Auth0 (popup, so invite-code state is preserved).
 * Sends the Auth0 ID token to POST /auth/auth0/ which verifies it
 * server-side (RS256/JWKS) and returns our own access/refresh pair.
 *
 * `connection` bypasses the Auth0 Universal Login chooser and goes
 * straight to Google. It must match the social connection name in the
 * Auth0 dashboard (default: "google-oauth2"); override with
 * VITE_AUTH0_CONNECTION if yours is named differently.
 */

/**
 * Client-side, non-sensitive diagnostic for a rejected token.
 * Decodes only the public payload (no verification) and compares its `aud`
 * with this app's client ID. Secrets are never printed. Returns "" when
 * there is nothing useful to add.
 */
function tokenDebugHint(token: string): string {
  const expected = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
  if (!token || token.split(".").length !== 3) {
    return " [debug: the returned token is not a JWT — sign-in did not yield an ID token]";
  }
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64)) as { aud?: unknown; iss?: unknown };
    const aud = String(payload.aud ?? "?");
    const iss = String(payload.iss ?? "?");
    const verdict =
      aud === expected ? "match" : "MISMATCH — restart the dev server";
    return ` [debug: token aud=${aud} iss=${iss} (app client: ${expected ?? "missing"}) ${verdict}]`;
  } catch {
    return "";
  }
}

export default function Auth0Button(props: Auth0ButtonProps) {
  // useAuth0() must only run inside the provider — main.tsx mounts it only
  // when configured, so gate the inner component instead of the hook.
  if (!getAuth0Config()) {
    return (
      <AlertBox tone="info">
        Social sign-in isn&apos;t configured yet — log in with your username
        and password.
      </AlertBox>
    );
  }
  return <Auth0ButtonInner {...props} />;
}

function Auth0ButtonInner({
  inviteCode = "",
  remember,
  requireInviteCode = false,
  isSignup = false,
  onSuccess,
}: Auth0ButtonProps) {
  const { loginWithPopup, getIdTokenClaims } = useAuth0();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setError("");
    if (requireInviteCode && !inviteCode.trim()) {
      setError("Enter your invite code first, then continue.");
      return;
    }
    setBusy(true);
    let sentToken = "";
    try {
      // Go straight to Google instead of the Auth0 login/register chooser.
      const connection =
        (import.meta.env.VITE_AUTH0_CONNECTION as string | undefined) ||
        "google-oauth2";
      await loginWithPopup({
        authorizationParams: isSignup
          ? { connection, screen_hint: "signup" }
          : { connection },
      });
      const claims = await getIdTokenClaims();
      const idToken = claims?.__raw;
      if (!idToken) {
        setError("Sign-in failed. Please try again.");
        return;
      }
      sentToken = idToken;
      const payload: Record<string, string> = { id_token: idToken };
      const code = inviteCode.trim();
      if (code) payload.invite_code = code;
      const res = await api.post("/auth/auth0/", payload);
      setAuthTokens(res.data.access, res.data.refresh, remember);
      onSuccess();
    } catch (err: unknown) {
      setError(
        firstApiError(err, "Sign-in failed. Please try again.") +
          tokenDebugHint(sentToken),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0 space-y-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#E0E0E0] bg-white px-[22px] py-3 text-base leading-[18.4px] font-normal text-black transition hover:border-[#CCCCCC] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <GoogleMark />
        {busy ? "Connecting…" : "Continue with Google"}
      </button>
      {error && <AlertBox>{error}</AlertBox>}
    </div>
  );
}

/**
 * Account-menu sign-out that also ends the Auth0 SSO session.
 * Render only when getAuth0Config() is non-null (same condition main.tsx
 * uses to mount the provider) — the hook requires the provider ancestor.
 */
export function Auth0SignOutMenuItem({ onSignedOut }: { onSignedOut: () => void }) {
  const { logout } = useAuth0();
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onSignedOut();
        logout({ logoutParams: { returnTo: window.location.origin } });
      }}
      className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm leading-5 font-normal text-black transition hover:bg-[#E8E8E8]"
    >
      <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>Logout</span>
    </button>
  );
}
