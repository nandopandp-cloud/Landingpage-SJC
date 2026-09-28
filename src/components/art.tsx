/** Logo PLEI · Exploradores (vetorial). */
import { useId } from "react";

/* ——— Logo ——— */
export function PleiLogo({ className = "", compact = false, large = false }: { className?: string; compact?: boolean; large?: boolean }) {
  const id = useId();
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true" className={large ? "h-[34px] w-[34px] lg:h-[clamp(40px,3.2vw,72px)] lg:w-[clamp(40px,3.2vw,72px)]" : "h-[34px] w-[34px]"}>
        <defs>
          <radialGradient id={`${id}p`} cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#bff4ff" />
            <stop offset=".5" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#312e81" />
          </radialGradient>
          <linearGradient id={`${id}r`} x1="0" x2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#67e8f9" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="15" fill={`url(#${id}p)`} />
        <ellipse cx="32" cy="33" rx="27" ry="8" fill="none" stroke={`url(#${id}r)`} strokeWidth="3" transform="rotate(-20 32 33)" />
        <circle cx="52" cy="14" r="2.4" fill="#e0f2fe" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={`font-bold tracking-[-0.02em] text-white ${large ? "text-[1.35rem] lg:text-[clamp(1.5rem,2.1vw,2.9rem)] lg:leading-[1]" : "text-[1.35rem]"}`}>PLEI</span>
        {!compact && (
          <span className={`mt-0.5 font-mono tracking-[0.28em] text-ink-2 ${large ? "text-[0.52rem] lg:text-[clamp(0.55rem,0.66vw,0.9rem)]" : "text-[0.52rem]"}`}>
            EXPLORADORES
          </span>
        )}
      </span>
    </span>
  );
}
