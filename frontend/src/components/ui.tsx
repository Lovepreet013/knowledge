import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

// Figma system tuned with Jasper refs: black stays the app primary CTA;
// 12px 22px / 8px / 46px desktop, compact sm variant for nav/hero.
// Hover = opacity or wash fill, never translate+hard-shadow.
export function SharpButton({
  to,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  children,
}: {
  to?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "brand";
  size?: "md" | "sm";
  disabled?: boolean;
  children: ReactNode;
}) {
  const base =
    size === "sm"
      ? "inline-flex min-h-[40px] items-center justify-center rounded-lg px-4 py-2 text-sm leading-[18.4px] font-normal transition disabled:cursor-not-allowed"
      : "inline-flex min-h-[46px] items-center justify-center rounded-lg px-[22px] py-3 text-base leading-[18.4px] font-normal transition disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:opacity-85 active:bg-[#1A1A1A] disabled:bg-[#CCCCCC] disabled:text-[#999999] disabled:hover:opacity-100"
      : variant === "brand"
        ? "bg-[#7C3AED] text-white hover:opacity-85 active:opacity-100 disabled:bg-[#CCCCCC] disabled:text-[#999999] disabled:hover:opacity-100"
        : variant === "danger"
          ? "bg-[#972121] text-white hover:opacity-85 active:opacity-100 disabled:bg-[#CCCCCC] disabled:text-[#999999] disabled:hover:opacity-100"
          : "border border-black bg-transparent text-black hover:bg-[#F5F5F5] active:bg-[#E0E0E0] active:border-[#1A1A1A] disabled:border-[#CCCCCC] disabled:text-[#999999] disabled:hover:bg-transparent";
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
  badgeTone = "warm",
  title,
  sub,
  actions,
}: {
  badge: string;
  badgeTone?: "warm" | "black";
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
              ? "font-display inline-block rounded-lg bg-black px-2 py-0.5 text-sm leading-[18.2px] font-medium text-white"
              : "font-display inline-block rounded-lg bg-[#FFB3B3] px-2 py-0.5 text-sm leading-[18.2px] font-medium text-black"
          }
        >
          {badge}
        </p>
        <h1 className="font-display mt-4 text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black sm:text-[40px] sm:leading-[44px]">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-[25.2px] font-normal text-black">{sub}</p>
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
    tone === "error"
      ? "border-[#972121] bg-white text-[#972121]"
      : "border-[#E0E0E0] bg-[#F5F5F5] text-black";
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-base leading-[22.4px] font-normal ${toneCls}`}
    >
      {children}
    </p>
  );
}

export function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rounded-lg border border-[#E0E0E0] bg-white px-6 py-10 text-center">
      <p className="text-base leading-[22.4px] font-normal text-black">{title}</p>
      <p className="mt-2 text-sm leading-5 font-normal text-[#666666]">{sub}</p>
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="rounded-lg border border-[#E0E0E0] bg-white px-4 py-3" aria-busy="true">
      <p className="animate-pulse font-display text-sm leading-[18.2px] font-normal text-black">{label}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const cls =
    key === "ready" || key === "active"
      ? "border-black bg-black text-white"
      : key === "failed"
        ? "border-[#972121] bg-[#972121] text-white"
        : "border-[#E0E0E0] bg-[#F5F5F5] text-black";
  return (
    <span
      className={`font-display inline-block rounded border px-2 py-0.5 text-xs leading-4 font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

export const inputCls =
  "w-full min-h-[44px] rounded-lg border border-[#CCCCCC] bg-white px-4 py-3 text-base leading-[22.4px] font-normal text-black placeholder:text-[#999999] hover:border-[#999999] focus:border-black focus:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:border-[#E0E0E0] disabled:bg-[#F5F5F5] disabled:text-[#CCCCCC]";

export const labelCls = "mb-2 block font-display text-sm leading-[18.2px] font-normal text-black";

// ── Marketing-only primitives (homepage): Jasper patterns translated into
// Figma tokens. 12px radius, 1px borders, pastel fills are illustration-only
// and must never carry body text. ──

export function Pill({
  children,
  tone = "white",
}: {
  children: ReactNode;
  tone?: "white" | "warm" | "brand-tint";
}) {
  const cls =
    tone === "warm"
      ? "bg-[#FFB3B3] text-black"
      : tone === "brand-tint"
        ? "bg-[#EDE9FE] text-[#7C3AED]"
        : "border border-[#E0E0E0] bg-white text-black";
  return (
    <span
      className={`font-display inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm leading-[18.2px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06)] ${cls}`}
    >
      {children}
    </span>
  );
}

export function MarketingCard({
  eyebrow,
  title,
  body,
  icon,
  tint,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  icon?: ReactNode;
  tint?: string;
}) {
  return (
    <article
      className="group flex min-h-[220px] flex-col rounded-xl border border-[#E0E0E0] bg-white p-6 transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      style={tint ? { background: tint } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow !== undefined && (
            <p className="font-display text-xs leading-4 font-normal text-[#666666]">{eyebrow}</p>
          )}
          <h3 className="font-display mt-2 text-lg leading-[25.2px] font-medium tracking-[-0.02em] text-black">
            {title}
          </h3>
        </div>
        {icon !== undefined && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#E0E0E0] bg-white text-black">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm leading-5 font-normal text-[#666666]">{body}</p>
      <span aria-hidden="true" className="mt-auto pt-4 text-black">
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </article>
  );
}

export function StatCard({
  value,
  label,
  footer,
  tint,
}: {
  value: string;
  label: string;
  footer?: ReactNode;
  tint?: string;
}) {
  return (
    <article
      className="flex min-h-[190px] flex-col rounded-xl border border-[#E0E0E0] bg-white p-6"
      style={tint ? { background: tint } : undefined}
    >
      <p className="font-display text-[32px] leading-[36px] font-medium tracking-[-0.03em] text-black">
        {value}
      </p>
      <p className="mt-2 text-sm leading-5 font-normal text-black">{label}</p>
      {footer !== undefined && (
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm font-normal text-black">
          {footer}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </div>
      )}
    </article>
  );
}
