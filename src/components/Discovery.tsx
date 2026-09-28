import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { fmtPct, incidentStats as S, type CategoryId } from "../data/incidents";
import { CountUp, Icon, Reveal, Starfield } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/*
 * Geometria medida na referência (design/ref-grande-descoberta.png, 1672×941).
 * A faixa dos dois sistemas ocupa y=200…660 da referência → caixa 1672×460.
 * Cada sistema usa uma caixa local de 810×460.
 */
const SYS_W = 810;
const SYS_H = 460;

type Glyph = "user" | "doc" | "group" | "card" | "lock" | "key";

interface SystemSpec {
  id: CategoryId;
  name: [string, string];
  tone: "cyan" | "violet";
  planet: { x: number; y: number; r: number };
  nodes: { glyph: Glyph; x: number; y: number }[];
}

const SYSTEMS: Record<string, Omit<SystemSpec, "id">> = {
  cadastro_alunos: {
    name: ["Cadastro", "vínculo de alunos"],
    tone: "cyan",
    planet: { x: 427, y: 237, r: 150 },
    nodes: [
      { glyph: "user", x: 263, y: 85 },
      { glyph: "doc", x: 597, y: 117 },
      { glyph: "group", x: 182, y: 342 },
    ],
  },
  acesso_credenciais: {
    name: ["Acesso", "credenciais"],
    tone: "violet",
    planet: { x: 383, y: 237, r: 150 },
    nodes: [
      { glyph: "card", x: 213, y: 122 },
      { glyph: "lock", x: 548, y: 80 },
      { glyph: "key", x: 633, y: 306 },
    ],
  },
};

const TONES = {
  cyan: {
    main: "#22d3ee",
    soft: "#7dd3fc",
    dot: ["#67e8f9", "#38bdf8", "#a5f3fc"],
    planet:
      "radial-gradient(circle at 34% 28%, #b5f4ff 0%, #45c3f5 16%, #0f86d4 36%, #1c46a8 60%, #0b1a4a 84%, #060d2c 100%)",
    glow: "0 0 70px 12px rgba(34,211,238,.35), 0 0 170px 40px rgba(37,99,235,.25)",
    node: { border: "rgba(103,232,249,.6)", glow: "rgba(34,211,238,.35)", icon: "#e0f7ff" },
    plus: "#22d3ee",
  },
  violet: {
    main: "#a78bfa",
    soft: "#c4b5fd",
    dot: ["#c4b5fd", "#a78bfa", "#e9d5ff"],
    planet:
      "radial-gradient(circle at 34% 28%, #d9ccff 0%, #9b87f5 16%, #6d4fd8 36%, #3f2596 58%, #1d0f55 80%, #0c0628 100%)",
    glow: "0 0 70px 12px rgba(139,92,246,.38), 0 0 170px 40px rgba(99,102,241,.22)",
    node: { border: "rgba(196,181,253,.6)", glow: "rgba(139,92,246,.4)", icon: "#f3edff" },
    plus: "#a78bfa",
  },
} as const;

const gradientText = {
  backgroundImage: "linear-gradient(100deg,#5eead4 0%,#60a5fa 50%,#a78bfa 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

const ellipsePath = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0`;

function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export function Discovery() {
  const reduce = !!useReducedMotion();
  const desktop = useMedia("(min-width: 1024px)");
  const systems: SystemSpec[] = S.topTwo.ids.map((id) => ({ id, ...SYSTEMS[id] }));
  if (desktop) return <PlateDiscovery reduce={reduce} />;

  return (
    <section aria-labelledby="descoberta-title" className="relative isolate overflow-hidden bg-space-950 pb-20 pt-20 sm:pb-24 lg:pb-[4.5vw] lg:pt-[5vw]">
      <Backdrop reduce={reduce} />

      {/* ——— Cabeçalho ——— */}
      <Reveal className="relative mx-auto max-w-4xl px-4 text-center">
        <p className="eyebrow mb-5 text-[#5eead4] lg:!text-[clamp(0.72rem,0.8vw,0.95rem)] lg:!tracking-[0.3em]">A grande descoberta</p>
        <h2
          id="descoberta-title"
          className="text-[2.1rem] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl lg:text-[clamp(2.6rem,3.5vw,4rem)]"
        >
          <span className="block">Dois temas concentraram</span>{" "}
          <span className="block" style={gradientText}>
            a maior parte dos relatos.
          </span>
        </h2>
      </Reveal>

      {/* ——— Os dois sistemas ——— */}
      <div className="relative mx-auto mt-10 w-full max-w-[720px] px-2">
        <div className="flex flex-col items-center gap-2">
          <SystemView spec={systems[0]} side="left" reduce={reduce} />
          <Center reduce={reduce} />
          <SystemView spec={systems[1]} side="right" reduce={reduce} />
        </div>
      </div>

      {/* ——— Fechamento ——— */}
      <div className="relative mx-auto mt-10 max-w-2xl px-4 text-center">
        <Reveal>
          <p className="text-[1.08rem] leading-relaxed text-[#dfe4f5] lg:text-[clamp(1.05rem,1.2vw,1.35rem)]">
            Esses foram os pontos que mais exigiram nossa atenção.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-3 text-[1.08rem] leading-relaxed text-[#dfe4f5] lg:text-[clamp(1.05rem,1.2vw,1.35rem)]">
            E foi a partir deles que aprofundamos nossa investigação,
            <br className="hidden sm:block" /> começando pelo acesso.
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <a
            href="#acesso"
            className="group mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#5eead4]/30 bg-[#0b1433]/70 px-8 py-3.5 text-[0.95rem] font-medium text-[#5eead4] shadow-[0_0_30px_-8px_rgba(94,234,212,.35)] backdrop-blur transition hover:border-[#5eead4]/60 hover:bg-[#0f1c45]"
          >
            Ver a investigação
            <Icon name="arrow-right" size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ———————————————— Um sistema planetário ———————————————— */

function SystemView({ spec, side, reduce }: { spec: SystemSpec; side: "left" | "right"; reduce: boolean }) {
  const uid = useId().replace(/:/g, "");
  const t = TONES[spec.tone];
  const cat = S.byId[spec.id];
  const { x: cx, y: cy, r } = spec.planet;
  const tilt = side === "left" ? -6 : 6;
  const orbits = [
    { rx: 292, ry: 168, rot: tilt, dur: 22, dots: 3, width: 1.3, opacity: 0.55 },
    { rx: 218, ry: 118, rot: -tilt * 1.4, dur: 15, dots: 2, width: 1.1, opacity: 0.45 },
  ];

  return (
    <motion.div
      className="relative aspect-[810/460] w-full max-w-[640px] [container-type:inline-size]"
      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.2, delay: side === "left" ? 0 : 0.2, ease: EASE }}
    >
      {/* órbitas (atrás do planeta) */}
      <svg viewBox={`0 0 ${SYS_W} ${SYS_H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <filter id={`${uid}g`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse cx={cx} cy={cy + 4} rx={378} ry={214} fill="none" stroke={t.soft} strokeOpacity=".16" strokeDasharray="3 7" transform={`rotate(${tilt / 2} ${cx} ${cy})`} />
        {orbits.map((o, i) => (
          <g key={i} transform={`rotate(${o.rot} ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx={o.rx} ry={o.ry} fill="none" stroke={t.soft} strokeOpacity={o.opacity} strokeWidth={o.width} />
            {Array.from({ length: o.dots }).map((_, d) => {
              const phase = d / o.dots;
              const a = phase * Math.PI * 2 + i;
              return (
                <circle
                  key={d}
                  r={d === 0 ? 6 : 4.5}
                  fill={t.dot[(d + i) % t.dot.length]}
                  filter={`url(#${uid}g)`}
                  cx={reduce ? cx + o.rx * Math.cos(a) : 0}
                  cy={reduce ? cy + o.ry * Math.sin(a) : 0}
                >
                  {!reduce && (
                    <animateMotion
                      dur={`${o.dur}s`}
                      repeatCount="indefinite"
                      begin={`${-phase * o.dur - i * 3}s`}
                      path={ellipsePath(cx, cy, o.rx, o.ry)}
                    />
                  )}
                </circle>
              );
            })}
          </g>
        ))}
      </svg>

      {/* planeta */}
      <div
        className="absolute"
        style={{ left: `${((cx - r) / SYS_W) * 100}%`, top: `${((cy - r) / SYS_H) * 100}%`, width: `${((2 * r) / SYS_W) * 100}%`, aspectRatio: "1" }}
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{ background: `url(${spec.tone === "cyan" ? "/sections/planeta-ciano.webp" : "/sections/planeta-violeta.webp"}) center/cover, ${t.planet}`, boxShadow: `${t.glow}, 0 0 0 1.5px ${t.soft}55, inset -22px -26px 60px rgba(2,6,23,.62), inset 10px 10px 30px rgba(255,255,255,.18), inset 0 0 18px ${t.soft}66` }}
          animate={reduce ? undefined : { scale: [1, 1.02, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: side === "left" ? 0 : 1.5 }}
        >
          {/* superfície: manchas suaves que derivam devagar */}
          <motion.div
            className="absolute inset-[-15%] opacity-35 mix-blend-soft-light"
            style={{
              background:
                "radial-gradient(22% 14% at 30% 55%, rgba(255,255,255,.6), transparent 70%), radial-gradient(18% 10% at 62% 40%, rgba(255,255,255,.5), transparent 70%), radial-gradient(30% 12% at 55% 75%, rgba(255,255,255,.4), transparent 70%), radial-gradient(14% 9% at 75% 62%, rgba(0,0,0,.6), transparent 70%)",
            }}
            animate={reduce ? undefined : { x: ["-5%", "5%", "-5%"] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.14)]" />
        </motion.div>
        <div className="relative grid h-full w-full place-content-center text-center">
          <p className="font-bold leading-none tracking-[-0.04em] text-white [font-size:max(2rem,7.6cqw)] [text-shadow:0_4px_24px_rgba(0,0,0,.35)]">
            <CountUp to={cat.count} />
          </p>
          <p className="mt-[0.9cqw] text-white/90 [font-size:max(0.72rem,2.1cqw)]">{fmtPct(cat.share)} dos registros</p>
        </div>
      </div>

      {/* frente das órbitas: metade de baixo passa na frente do planeta */}
      <svg viewBox={`0 0 ${SYS_W} ${SYS_H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id={`${uid}c`}>
            <rect x="0" y={cy + 30} width={SYS_W} height={SYS_H} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${uid}c)`}>
          {orbits.map((o, i) => (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={o.rx}
              ry={o.ry}
              fill="none"
              stroke={t.soft}
              strokeOpacity={o.opacity * 0.9}
              strokeWidth={o.width}
              transform={`rotate(${o.rot} ${cx} ${cy})`}
            />
          ))}
        </g>
      </svg>

      {/* ícones em órbita */}
      {spec.nodes.map((n, i) => (
        <motion.span
          key={n.glyph}
          aria-hidden="true"
          className="absolute grid aspect-square w-[10.9%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full backdrop-blur-sm"
          style={{
            left: `${(n.x / SYS_W) * 100}%`,
            top: `${(n.y / SYS_H) * 100}%`,
            background: "radial-gradient(circle at 50% 35%, rgba(30,41,99,.85), rgba(8,12,36,.9))",
            border: `1.5px solid ${t.node.border}`,
            boxShadow: `0 0 26px 2px ${t.node.glow}, inset 0 0 18px ${t.node.glow}`,
            color: t.node.icon,
          }}
          animate={reduce ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
        >
          <NodeGlyph glyph={n.glyph} />
        </motion.span>
      ))}

      {/* rótulo */}
      <p
        className="absolute left-0 w-full -translate-y-1/2 text-center font-medium uppercase tracking-[0.14em] text-white [font-size:max(0.72rem,2.25cqw)]"
        style={{ top: `${(430 / SYS_H) * 100}%`, left: `${((cx - 405) / SYS_W) * 100}%`, width: `${(810 / SYS_W) * 100}%` }}
      >
        {spec.name[0]} <span style={{ color: t.main }}>+</span> {spec.name[1]}
      </p>
    </motion.div>
  );
}

/* ———————————————— Centro: "+ juntos, 54,70%" ———————————————— */

function Center({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative z-10 flex flex-col items-center py-4">
      <span aria-hidden="true" className="absolute -top-6 left-1/2 h-10 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent to-sky-300/80 shadow-[0_0_12px_rgba(56,189,248,.8)] " />
      <motion.span
        className="relative grid aspect-square w-16 place-items-center rounded-full text-white"
        style={{
          background: "radial-gradient(circle at 50% 40%, rgba(35,48,110,.95), rgba(8,12,36,.95))",
          border: "1.5px solid rgba(147,197,253,.45)",
          boxShadow: "0 0 34px 4px rgba(96,165,250,.45), inset 0 0 20px rgba(96,165,250,.35)",
        }}
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
        aria-hidden="true"
      >
        {!reduce && <span className="pulse-ring absolute inset-0 rounded-full border border-sky-300/40" />}
        <svg viewBox="0 0 24 24" className="h-[34%] w-[34%]">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </motion.span>
      <p className="mt-3 text-center text-white/85">juntos,</p>
      <p className="tabular text-center text-[1.7rem] font-semibold tracking-[-0.02em] text-white">
        {fmtPct(S.topTwo.share)}
      </p>
      <span aria-hidden="true" className="mt-2 h-10 w-[2px] bg-gradient-to-b from-violet-300/80 to-transparent shadow-[0_0_12px_rgba(167,139,250,.8)] " />
    </div>
  );
}

/* ———————————————— Cenário: planetas nos cantos, luas, nebulosas ———————————————— */

function Backdrop({ reduce }: { reduce: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <Starfield density={0.7} drift={false} />
      <div className="absolute -right-[5%] top-[5%] h-[40%] w-[35%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.14),transparent_65%)] blur-2xl" />
      <div className="absolute -left-[5%] bottom-[5%] h-[40%] w-[35%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.14),transparent_65%)] blur-2xl" />
      {/* planeta grande no canto superior esquerdo */}
      <div
        className="absolute -left-[9%] -top-[24%] aspect-square w-[27%] min-w-[220px] rounded-full"
        style={{
          background: "radial-gradient(circle at 70% 75%, #0f1d4d 0%, #070d28 45%, #04060f 75%)",
          boxShadow: "inset -3px -3px 6px rgba(165,210,255,.75), inset -10px -10px 26px rgba(59,130,246,.3), 0 0 50px rgba(37,99,235,.16)",
        }}
      />
      {/* planeta grande no canto inferior direito, com borda iluminada */}
      <div
        className="absolute -bottom-[46%] -right-[12%] aspect-square w-[40%] min-w-[300px] rounded-full"
        style={{
          background: "radial-gradient(circle at 28% 22%, #13265f 0%, #080f2e 38%, #04060f 70%)",
          boxShadow: "inset 4px 4px 7px rgba(186,225,255,.9), inset 14px 14px 34px rgba(59,130,246,.38), 0 0 70px rgba(59,130,246,.3)",
        }}
      />
      {/* luas */}
      {[
        { left: "19.4%", top: "8%", w: "2.8vw", delay: 0 },
        { left: "92.7%", top: "73%", w: "4.6vw", delay: 2 },
      ].map((m, i) => (
        <motion.span
          key={i}
          className="absolute aspect-square min-w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: m.left,
            top: m.top,
            width: m.w,
            background: "radial-gradient(circle at 32% 28%, #5b7bc8, #22346f 52%, #0a1033)",
            boxShadow: "0 0 22px rgba(96,165,250,.35)",
          }}
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: m.delay }}
        />
      ))}
    </div>
  );
}

function NodeGlyph({ glyph }: { glyph: Glyph }) {
  const cls = "h-[44%] w-[44%]";
  switch (glyph) {
    case "user":
      return (
        <svg viewBox="0 0 24 24" className={cls}>
          <circle cx="12" cy="8" r="4.2" fill="currentColor" />
          <path d="M4 20.5c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5z" fill="currentColor" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" className={cls}>
          <path d="M6 2.5h8.5l4.5 4.5v14.5H6z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M14.5 2.5V7H19M8.8 11h6.4M8.8 14h6.4M8.8 17h4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "group":
      return (
        <svg viewBox="0 0 24 24" className={cls}>
          <circle cx="12" cy="7.5" r="3.3" fill="currentColor" />
          <circle cx="5.5" cy="9" r="2.5" fill="currentColor" opacity=".85" />
          <circle cx="18.5" cy="9" r="2.5" fill="currentColor" opacity=".85" />
          <path d="M6.5 19c.5-3.4 2.8-5.3 5.5-5.3s5 1.9 5.5 5.3z" fill="currentColor" />
          <path d="M1.5 18c.3-2.5 1.8-3.9 4-3.9 1 0 1.8.3 2.5.8-1 1-1.6 2-1.9 3.1zM22.5 18c-.3-2.5-1.8-3.9-4-3.9-1 0-1.8.3-2.5.8 1 1 1.6 2 1.9 3.1z" fill="currentColor" opacity=".85" />
        </svg>
      );
    case "card":
      return (
        <svg viewBox="0 0 24 24" className={cls}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <rect x="5.5" y="9" width="5.5" height="5.5" rx="1" fill="currentColor" />
          <path d="M13.5 10h5M13.5 13h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 24 24" className={cls}>
          <path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="5" y="10.5" width="14" height="10.5" rx="2.4" fill="currentColor" />
          <circle cx="12" cy="15.2" r="1.5" fill="#1e1b4b" />
          <path d="M12 16v2" stroke="#1e1b4b" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "key":
      return (
        <svg viewBox="0 0 24 24" className={cls}>
          <circle cx="7" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M11 12h10.5M17.5 12v3M20.5 12v2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
  }
}

/* ———————————————— Desktop: arte da referência + camada viva ———————————————— */

/*
 * A arte (public/sections/descoberta.webp) é a referência aprovada sem textos, números e botão
 * (scripts/make_hero_plates.py → discovery()). Tudo o que é informação volta aqui, ao vivo,
 * nas mesmas coordenadas (px da imagem 1672×941 → % e cqw).
 */
const P_W = 1672;
const P_H = 941;
const at = (x: number, y: number) => ({ left: `${(x / P_W) * 100}%`, top: `${(y / P_H) * 100}%` });
const cq = (px: number) => `${(px / P_W) * 100}cqw`;

function PlateDiscovery({ reduce }: { reduce: boolean }) {
  const uid = useId().replace(/:/g, "");
  const [a, b] = S.topTwo.ids.map((id) => ({ id, cat: S.byId[id], ...SYSTEMS[id] }));
  const planets = [
    { ...a, cx: 447, cy: 437, glow: "34,211,238", plus: "#22d3ee" },
    { ...b, cx: 1225, cy: 437, glow: "139,92,246", plus: "#a78bfa" },
  ];
  // pontos de luz das órbitas e ícones já estão na arte: aqui eles "respiram"
  const glints = [
    [423, 221, "103,232,249"], [180, 380, "103,232,249"], [628, 532, "103,232,249"], [341, 576, "96,165,250"],
    [1218, 220, "196,181,253"], [1493, 379, "196,181,253"], [1040, 527, "196,181,253"], [1323, 576, "221,214,254"], [1590, 531, "167,139,250"],
    [45, 352, "191,219,254"], [1515, 88, "191,219,254"], [1620, 28, "221,214,254"],
  ] as const;
  const nodes = [
    [282, 285, "103,232,249"], [617, 317, "147,197,253"], [202, 542, "103,232,249"],
    [1055, 322, "196,181,253"], [1390, 280, "196,181,253"], [1475, 506, "167,139,250"],
  ] as const;
  const beams = ["M 600 470 C 680 458 732 412 794 405", "M 1072 470 C 992 458 940 412 878 405"];
  const fade = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-8% 0px" }, transition: { duration: 0.9, delay, ease: EASE } };

  return (
    <section
      aria-labelledby="descoberta-title"
      className="relative isolate w-full overflow-hidden bg-space-950 [container-type:inline-size]"
      style={{ aspectRatio: `${P_W} / ${P_H}` }}
    >
      <motion.img
        src="/sections/descoberta.webp"
        alt=""
        width={P_W}
        height={P_H}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full select-none"
        draggable={false}
        initial={reduce ? false : { scale: 1.05, opacity: 0.4 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: EASE }}
      />

      {/* ——— camada animada ——— */}
      {!reduce && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {planets.map((p, i) => (
            <motion.span
              key={p.id}
              className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
              style={{ ...at(p.cx, p.cy), width: cq(420), background: `radial-gradient(closest-side, rgba(${p.glow},.0) 62%, rgba(${p.glow},.28) 74%, transparent 100%)` }}
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.98, 1.03, 0.98] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 1.2 }}
            />
          ))}
          {glints.map(([x, y, c], i) => (
            <motion.span
              key={i}
              className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
              style={{ ...at(x, y), width: cq(34), background: `radial-gradient(closest-side, rgba(${c},.95), rgba(${c},.25) 45%, transparent 100%)` }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.15, 0.7] }}
              transition={{ duration: 2.6 + (i % 4) * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.37 }}
            />
          ))}
          {nodes.map(([x, y, c], i) => (
            <span key={i} className="absolute aspect-square -translate-x-1/2 -translate-y-1/2" style={{ ...at(x, y), width: cq(90) }}>
              <span className="pulse-ring absolute inset-0 rounded-full border" style={{ borderColor: `rgba(${c},.55)`, animationDelay: `${i * 0.55}s`, animationDuration: "3.2s" }} />
            </span>
          ))}
          {/* "+" central */}
          <span className="absolute aspect-square -translate-x-1/2 -translate-y-1/2" style={{ ...at(836, 405), width: cq(86) }}>
            <span className="pulse-ring absolute inset-0 rounded-full border border-sky-300/60" />
            <span className="pulse-ring absolute inset-0 rounded-full border border-violet-300/40" style={{ animationDelay: "1.2s" }} />
          </span>
          {/* partículas correndo pelo feixe até o centro */}
          <svg viewBox={`0 0 ${P_W} ${P_H}`} className="absolute inset-0 h-full w-full">
            <defs>
              <filter id={`${uid}f`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {beams.map((d, i) =>
              [0, 1, 2, 3].map((k) => (
                <circle key={`${i}${k}`} r={k % 2 ? 2.4 : 3.4} fill={i === 0 ? "#bff4ff" : "#e4dcff"} filter={`url(#${uid}f)`}>
                  <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${-k * 0.6}s`} path={d} />
                  <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" repeatCount="indefinite" begin={`${-k * 0.6}s`} />
                </circle>
              )),
            )}
          </svg>
        </div>
      )}

      {/* ——— cabeçalho ——— */}
      <motion.div className="absolute inset-x-0 text-center" style={{ top: `${(82 / P_H) * 100}%` }} {...fade(0)}>
        <p className="font-mono font-medium uppercase text-[#5eead4]" style={{ fontSize: `max(11px, ${cq(13.5)})`, letterSpacing: "0.3em" }}>
          A grande descoberta
        </p>
        <h2
          id="descoberta-title"
          className="font-bold tracking-[-0.03em] text-white"
          style={{ fontSize: `max(1.9rem, ${cq(52)})`, lineHeight: 0.98, marginTop: cq(22) }}
        >
          <span className="block">Dois temas concentraram</span>{" "}
          <span className="inline-block" style={gradientText}>
            a maior parte dos relatos.
          </span>
        </h2>
      </motion.div>

      {/* ——— números nos planetas ——— */}
      {planets.map((p, i) => (
        <motion.div
          key={p.id}
          className="absolute -translate-x-1/2 text-center"
          style={{ ...at(p.cx, 390), width: cq(300) }}
          {...fade(0.3 + i * 0.15)}
        >
          <p className="font-bold leading-none tracking-[-0.04em] text-white [text-shadow:0_4px_24px_rgba(0,0,0,.45)]" style={{ fontSize: cq(66) }}>
            <CountUp to={p.cat.count} />
          </p>
          <p className="text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,.5)]" style={{ fontSize: `max(12px, ${cq(17)})`, marginTop: cq(13) }}>
            {fmtPct(p.cat.share)} dos registros
          </p>
        </motion.div>
      ))}

      {/* ——— juntos ——— */}
      <motion.div className="absolute -translate-x-1/2 text-center" style={{ ...at(836, 471), width: cq(200) }} {...fade(0.6)}>
        <p className="text-white/85" style={{ fontSize: `max(12px, ${cq(16)})` }}>
          juntos,
        </p>
        <p className="tabular font-semibold tracking-[-0.01em] text-white" style={{ fontSize: `max(18px, ${cq(29)})`, marginTop: cq(4) }}>
          {fmtPct(S.topTwo.share)}
        </p>
      </motion.div>

      {/* ——— rótulos ——— */}
      {planets.map((p, i) => (
        <motion.p
          key={p.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-medium uppercase text-white"
          style={{ ...at(p.cx, 630), fontSize: `max(12px, ${cq(18)})`, letterSpacing: "0.14em" }}
          {...fade(0.45 + i * 0.15)}
        >
          {p.name[0]} <span style={{ color: p.plus }}>+</span> {p.name[1]}
        </motion.p>
      ))}

      {/* ——— fechamento ——— */}
      <motion.div className="absolute inset-x-0 text-center text-[#dfe4f5]" style={{ top: `${(701 / P_H) * 100}%`, fontSize: `max(14px, ${cq(20)})` }} {...fade(0.2)}>
        <p style={{ lineHeight: 1.4 }}>Esses foram os pontos que mais exigiram nossa atenção.</p>
        <p style={{ lineHeight: 1.7, marginTop: cq(14) }}>
          E foi a partir deles que aprofundamos nossa investigação,
          <br />
          começando pelo acesso.
        </p>
      </motion.div>
      <motion.div className="absolute -translate-x-1/2 -translate-y-1/2" style={at(836, 860)} {...fade(0.35)}>
        <a
          href="#acesso"
          className="group inline-flex items-center justify-center rounded-full border border-[#5eead4]/30 bg-[#0b1433]/80 font-medium text-[#5eead4] shadow-[0_0_30px_-8px_rgba(94,234,212,.35)] backdrop-blur transition hover:border-[#5eead4]/60 hover:bg-[#0f1c45]"
          style={{ width: cq(216), height: `max(40px, ${cq(48)})`, fontSize: `max(13px, ${cq(15.5)})`, gap: cq(10) }}
        >
          Ver a investigação
          <Icon name="arrow-right" size={14} className="transition-transform group-hover:translate-x-0.5" />
        </a>
      </motion.div>
    </section>
  );
}
