import type { ReactNode } from "react";
import { Link } from "react-router";

export function SharpButton({
  to,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  children,
}: {
  to?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center border-2 border-neutral-950 px-4 py-2 text-[13px] font-bold tracking-[-0.01em] uppercase transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none";
  const styles =
    variant === "primary"
      ? "bg-neutral-950 text-white shadow-[4px_4px_0_#a3a3a3] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#a3a3a3] active:translate-x-0 active:translate-y-0 active:shadow-none"
      : variant === "danger"
        ? "bg-red-600 text-white shadow-[4px_4px_0_#0a0a0b] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#0a0a0b] active:translate-x-0 active:translate-y-0 active:shadow-none"
        : "bg-white text-neutral-950 shadow-[4px_4px_0_#0a0a0b] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#0a0a0b] active:translate-x-0 active:translate-y-0 active:shadow-none";
  const cls = `${base} ${styles}`;
  if (to !== undefined) {
    return (
      <Link to={to} className={cls} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function PageHeader({
  badge,
  badgeTone = "yellow",
  title,
  sub,
  actions,
}: {
  badge: string;
  badgeTone?: "yellow" | "black";
  title: string;
  sub: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p
          className={
            badgeTone === "black"
              ? "inline-block border-2 border-neutral-950 bg-neutral-950 px-2 py-0.5 text-[11px] font-extrabold tracking-[0.1em] text-white uppercase"
              : "inline-block border-2 border-neutral-950 bg-[#FFD02F] px-2 py-0.5 text-[11px] font-extrabold tracking-[0.1em] uppercase"
          }
        >
          {badge}
        </p>
        <h1 className="mt-2.5 text-3xl font-extrabold tracking-[-0.04em]">{title}</h1>
        <p className="mt-1 text-[13.5px] font-medium tracking-[-0.01em] text-neutral-500">{sub}</p>
      </div>
      {actions !== undefined && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function AlertBox({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const toneCls =
    tone === "success"
      ? "bg-emerald-50 text-emerald-800"
      : tone === "info"
        ? "bg-blue-50 text-neutral-800"
        : "bg-red-50 text-red-700";
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`border-2 border-neutral-950 px-3 py-2 text-[13px] font-bold tracking-[-0.01em] shadow-[3px_3px_0_#0a0a0b] ${toneCls}`}>
      {children}
    </p>
  );
}

export function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="border-2 border-dashed border-neutral-950 bg-neutral-50 px-6 py-10 text-center">
      <p className="text-[15px] font-extrabold tracking-[-0.02em]">{title}</p>
      <p className="mt-1 text-[13px] font-medium tracking-[-0.01em] text-neutral-500">{sub}</p>
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="border-2 border-neutral-950 bg-white px-4 py-3 shadow-[4px_4px_0_#0a0a0b]" aria-busy="true">
      <p className="animate-pulse text-[13px] font-extrabold tracking-[0.08em] uppercase">{label}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-neutral-100 text-neutral-700",
    processing: "bg-[#FFD02F] text-neutral-950",
    ready: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-600 text-white",
    active: "bg-emerald-100 text-emerald-800",
    inactive: "bg-neutral-100 text-neutral-600",
  };
  const cls = map[status.toLowerCase()] ?? "bg-neutral-100 text-neutral-700";
  return (
    <span className={`inline-block border-2 border-neutral-950 px-2 py-0.5 text-[10.5px] font-extrabold tracking-[0.08em] uppercase ${cls}`}>
      {status}
    </span>
  );
}

export const inputCls =
  "w-full border-2 border-neutral-950 bg-white px-3 py-2 text-[13px] font-medium tracking-[-0.01em] text-neutral-950 placeholder:font-medium placeholder:text-neutral-400 focus:shadow-[4px_4px_0_#0a0a0b] focus:outline-none disabled:opacity-60";

export const labelCls =
  "mb-1.5 block text-[11.5px] font-extrabold tracking-[0.08em] uppercase";
