import type { ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const inputWithIconCls =
  "w-full min-h-[44px] rounded-lg border border-[#CCCCCC] bg-white py-3 pr-4 pl-11 text-base leading-[22.4px] font-normal text-black placeholder:text-[#999999] hover:border-[#999999] focus:border-black focus:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:border-[#E0E0E0] disabled:bg-[#F5F5F5]";

/** A text input with a leading icon positioned inside the field. */
export function IconInput({
  id,
  icon,
  className,
  ...rest
}: {
  id: string;
  icon: ReactNode;
} & Omit<React.ComponentProps<"input">, "id">) {
  return (
    <div className="relative min-w-0">
      <span
        className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#666666]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <input
        id={id}
        className={`${inputWithIconCls}${className ? ` ${className}` : ""}`}
        {...rest}
      />
    </div>
  );
}

/** A password input with a show/hide toggle button and leading lock icon. */
export function PasswordInput({
  id,
  icon,
  ...rest
}: {
  id: string;
  icon: ReactNode;
} & Omit<React.ComponentProps<"input">, "id" | "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative min-w-0">
      <span
        className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#666666]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <input
        id={id}
        type={show ? "text" : "password"}
        className={`${inputWithIconCls} pr-14`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-pressed={show}
        aria-label={show ? "Hide password" : "Show password"}
        title={show ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-black transition hover:bg-[#F5F5F5]"
      >
        {show ? (
          <EyeOff className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Eye className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/** Inline Google "G" logo mark for the social sign-in button. */
export function GoogleMark() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
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
