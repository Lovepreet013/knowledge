/** Shared Auth0 SPA config from Vite env. Null when not configured. */
export function getAuth0Config(): { domain: string; clientId: string } | null {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
  if (!domain || !clientId) return null;
  return { domain, clientId };
}
