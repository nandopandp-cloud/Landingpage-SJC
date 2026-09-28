import { animate, motion, useInView, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import type { Certainty, ImprovementStatus } from "../data/content";
import { statusLabel } from "../data/content";

/* ——— Reveal ao rolar ——— */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
  ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" } & Omit<
  HTMLMotionProps<"div">,
  "children"
>) {
  const reduce = useReducedMotion();
  const Comp = as === "li" ? motion.li : as === "section" ? motion.section : motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      {...(rest as object)}
    >
      {children}
    </Comp>
  );
}

/* ——— Contador (0 → valor) ——— */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1.8,
  className,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const fmt = useMemo(
    () => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    [decimals],
  );
  const final = `${fmt.format(to)}${suffix}`;
  const [text, setText] = useState(reduce ? final : `${fmt.format(0)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setText(final);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setText(`${fmt.format(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration, fmt, suffix, final]);

  return (
    <span ref={ref} className={className}>
      {/* leitores de tela recebem o valor final, sem a contagem */}
      <span aria-hidden="true" className="tabular">
        {text}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}

/* ——— Cabeçalho de seção ——— */
export function SectionHeader({
  eyebrow,
  title,
  lede,
  tone = "night",
  align = "left",
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: "night" | "day";
  align?: "left" | "center";
  id?: string;
}) {
  const day = tone === "day";
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className={`eyebrow mb-4 ${day ? "text-azure" : "text-cyan"}`}>{eyebrow}</p>}
      <h2 id={id} className={`headline text-[2rem] sm:text-5xl lg:text-[3.4rem] ${day ? "text-day-ink" : "text-ink"}`}>
        {title}
      </h2>
      {lede && (
        <p className={`lede mt-5 text-base sm:text-lg leading-relaxed ${day ? "text-day-ink-2" : "text-ink-2"}`}>{lede}</p>
      )}
    </Reveal>
  );
}

/* ——— Selos ——— */
export function StatusBadge({ status, tone = "day" }: { status: ImprovementStatus; tone?: "day" | "night" }) {
  const day = tone === "day";
  const styles: Record<ImprovementStatus, string> = {
    implementado: day ? "bg-emerald-50 text-stable-ink ring-emerald-600/20" : "bg-emerald-400/10 text-stable ring-emerald-400/30",
    em_andamento: day ? "bg-amber-50 text-amber-800 ring-amber-600/20" : "bg-amber-400/10 text-amber-300 ring-amber-400/30",
    planejado: day ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20" : "bg-indigo-400/10 text-indigo-200 ring-indigo-300/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium ring-1 ${styles[status]}`}>
      <StatusGlyph status={status} />
      {statusLabel[status]}
    </span>
  );
}

function StatusGlyph({ status }: { status: ImprovementStatus }) {
  // forma distinta por status → não depende só de cor
  if (status === "implementado")
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="6" cy="6" r="5.25" fill="currentColor" opacity=".18" />
        <path d="M3.4 6.2 5.2 8l3.4-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (status === "em_andamento")
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M6 1a5 5 0 0 1 0 10z" fill="currentColor" />
      </svg>
    );
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.2 1.8" />
    </svg>
  );
}

export function CertaintyBadge({ kind, tone = "night" }: { kind: Certainty | "contexto"; tone?: "day" | "night" }) {
  const day = tone === "day";
  const map = {
    fato: { label: "O que aconteceu", cls: day ? "text-day-ink-2 bg-day-2" : "text-ink-2 bg-white/5" },
    contexto: { label: "Contexto", cls: day ? "text-day-ink-3 bg-day-2" : "text-ink-3 bg-white/[0.04]" },
    hipotese: {
      label: "Principal hipótese",
      cls: day ? "text-hypo-ink bg-amber-100 ring-1 ring-amber-500/30" : "text-amber-200 bg-amber-400/10 ring-1 ring-amber-300/30",
    },
    acao: { label: "O que fizemos", cls: day ? "text-stable-ink bg-emerald-50" : "text-emerald-200 bg-emerald-400/10" },
    plano: { label: "Planejado", cls: day ? "text-indigo-700 bg-indigo-50" : "text-indigo-200 bg-indigo-400/10" },
  } as const;
  const m = map[kind];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium tracking-wide ${m.cls}`}>
      {kind === "hipotese" && (
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
          <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M4.6 4.6a1.5 1.5 0 1 1 2.1 1.4c-.5.2-.7.5-.7 1v.3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="6" cy="8.9" r=".7" fill="currentColor" />
        </svg>
      )}
      {m.label}
    </span>
  );
}

/* ——— Spotlight que segue o ponteiro ——— */
export function useSpotlight() {
  return (e: RPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
}

/* ——— Estrelas ——— */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function starShadows(seed: number, count: number, w: number, h: number, size: number, tint: string[]) {
  const rnd = mulberry32(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(rnd() * w);
    const y = Math.round(rnd() * h);
    const c = tint[Math.floor(rnd() * tint.length)];
    out.push(`${x}px ${y}px 0 ${size}px ${c}`);
    // repete à direita para o loop horizontal sem emenda
    out.push(`${x + w}px ${y}px 0 ${size}px ${c}`);
  }
  return out.join(",");
}

/** Três camadas de estrelas em box-shadow — nenhum canvas, custo quase zero. */
export function Starfield({ density = 1, className = "", drift = true }: { density?: number; className?: string; drift?: boolean }) {
  const layers = useMemo(
    () => [
      { s: starShadows(7, Math.round(220 * density), 1600, 1100, 0, ["#ffffff99", "#c7d2fe88", "#a5f3fc77"]), cls: drift ? "drift-slow" : "" },
      { s: starShadows(19, Math.round(90 * density), 1600, 1100, 0.5, ["#ffffffcc", "#bae6fdaa"]), cls: `twinkle ${drift ? "drift-mid" : ""}` },
      { s: starShadows(41, Math.round(24 * density), 1600, 1100, 1, ["#ffffff", "#cffafe"]), cls: "twinkle" },
    ],
    [density, drift],
  );
  return (
    <div className={`stars ${className}`} aria-hidden="true">
      {layers.map((l, i) => (
        <i key={i} className={l.cls} style={{ boxShadow: l.s, animationDelay: `${i * -1.7}s` }} />
      ))}
    </div>
  );
}

/* ——— Ícones (traço 1.6, 24px) ——— */
type IconName =
  | "radar"
  | "server"
  | "deploy"
  | "contingency"
  | "support"
  | "key"
  | "users"
  | "clipboard"
  | "id"
  | "book"
  | "search"
  | "lock"
  | "wifi"
  | "shield"
  | "spark"
  | "alert"
  | "check"
  | "arrow-right"
  | "chevron-left"
  | "chevron-right"
  | "play"
  | "pause"
  | "menu"
  | "close"
  | "layers"
  | "eye";

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, ReactNode> = {
    radar: (
      <>
        <circle cx="12" cy="12" r="9" {...p} />
        <circle cx="12" cy="12" r="5" {...p} />
        <path d="M12 12 18.4 5.6" {...p} />
        <circle cx="15.5" cy="9" r="1.2" fill="currentColor" />
      </>
    ),
    server: (
      <>
        <rect x="3.5" y="4" width="17" height="6.5" rx="2" {...p} />
        <rect x="3.5" y="13.5" width="17" height="6.5" rx="2" {...p} />
        <path d="M7 7.25h.01M7 16.75h.01M11 7.25h6M11 16.75h6" {...p} />
      </>
    ),
    deploy: (
      <>
        <path d="M5 19c1.5-4 4-7.5 8-10.5L19 3c-.5 4-2 7.5-5.5 10.5L9 18z" {...p} />
        <path d="M9 18l-3 3M7.5 13.5 4 12l3-3h4M10.5 16.5 12 20l3-3v-4" {...p} />
      </>
    ),
    contingency: (
      <>
        <path d="M12 3 20 7v5c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V7z" {...p} />
        <path d="M12 8v5M12 16h.01" {...p} />
      </>
    ),
    support: (
      <>
        <path d="M4 13v-1a8 8 0 0 1 16 0v1" {...p} />
        <rect x="3" y="13" width="4" height="6" rx="1.6" {...p} />
        <rect x="17" y="13" width="4" height="6" rx="1.6" {...p} />
        <path d="M19 19c0 1.5-2 2.5-5 2.5" {...p} />
      </>
    ),
    key: (
      <>
        <circle cx="8" cy="15" r="4" {...p} />
        <path d="m11 12 8-8M16 7l2 2M14 9l1.5 1.5" {...p} />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8.5" r="3.2" {...p} />
        <path d="M3 19.5c.6-3.3 3-5.2 6-5.2s5.4 1.9 6 5.2" {...p} />
        <circle cx="17" cy="9.5" r="2.4" {...p} />
        <path d="M16.5 14.4c2.3.2 4 1.7 4.5 4.3" {...p} />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="4.5" width="14" height="16.5" rx="2.4" {...p} />
        <path d="M9 4.5V3.5h6v1M8.5 10h7M8.5 13.5h7M8.5 17h4" {...p} />
      </>
    ),
    id: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.4" {...p} />
        <circle cx="8.5" cy="11" r="2.2" {...p} />
        <path d="M5.5 16.2c.6-1.6 1.7-2.3 3-2.3s2.4.7 3 2.3M14 10h4M14 13.5h3" {...p} />
      </>
    ),
    book: (
      <>
        <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" {...p} />
        <path d="M12 6.5v13" {...p} />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" {...p} />
        <path d="m16 16 4.5 4.5" {...p} />
      </>
    ),
    lock: (
      <>
        <rect x="4.5" y="10.5" width="15" height="10" rx="2.4" {...p} />
        <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.5" {...p} />
      </>
    ),
    wifi: (
      <>
        <path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0" {...p} />
        <circle cx="12" cy="19" r="1.1" fill="currentColor" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6.5v5.5c0 4.6-3.4 8.3-8 9-4.6-.7-8-4.4-8-9V6.5z" {...p} />
        <path d="m8.5 12 2.4 2.4 4.6-4.9" {...p} />
      </>
    ),
    spark: (
      <path d="M12 3.5 13.9 10l6.6 2-6.6 2L12 20.5 10.1 14l-6.6-2 6.6-2z" {...p} />
    ),
    alert: (
      <>
        <path d="M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" {...p} />
        <path d="M12 9.5v4M12 17h.01" {...p} />
      </>
    ),
    check: <path d="m5 12.5 4.5 4.5L19 7.5" {...p} />,
    "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" {...p} />,
    "chevron-left": <path d="m15 5-7 7 7 7" {...p} />,
    "chevron-right": <path d="m9 5 7 7-7 7" {...p} />,
    play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" />,
    pause: (
      <>
        <rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" />
        <rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h10" {...p} />,
    close: <path d="M6 6l12 12M18 6 6 18" {...p} />,
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5z" {...p} />
        <path d="m3 13 9 5 9-5" {...p} />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" {...p} />
        <circle cx="12" cy="12" r="3" {...p} />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {paths[name]}
    </svg>
  );
}
