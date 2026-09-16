import api from "./api";

/**
 * Pull the first human-readable error string out of a DRF error response.
 * Falls back to `fallback` when the shape doesn't match.
 */
export function firstApiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } }).response?.data as
    | Record<string, unknown>
    | undefined;
  if (!data || typeof data !== "object") return fallback;
  if (typeof data.detail === "string") return data.detail;
  for (const value of Object.values(data)) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }
  return fallback;
}

/** Extracts the filename from a full path (e.g. "documents/2026/09/handbook.pdf" → "handbook.pdf"). */
export function baseName(path: string): string {
  return path.split("/").pop() ?? path;
}

/** Formats an ISO date string into a short locale string. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Resolves a potentially-relative file path from the API into a full URL. */
export function fileUrl(raw: string): string {
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const base = (api.defaults.baseURL ?? "http://localhost:8000/api").replace(
    /\/api\/?$/,
    "",
  );
  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}
