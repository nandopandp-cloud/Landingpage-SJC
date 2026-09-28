import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { olympics, whatHappened } from "../data/content";
import { Reveal, Starfield } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

const gradientText = {
  backgroundImage: "linear-gradient(100deg,#5eead4 0%,#60a5fa 50%,#a78bfa 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

type CardIcon = "lock" | "users" | "doc";

/**
 * Cards de vidro em volta do planeta (coordenadas em % do quadro da ilustração, medidas na referência).
 * Cada card entra girando para a posição e depois flutua devagar.
 */
const issueCards: {
  icon: CardIcon;
  title: [string, string];
  left: number;
  top: number;
  width: number;
  rotate: number;
  tilt: number;
  tone: "cyan" | "violet";
  delay: number;
}[] = [
  { icon: "lock", title: ["Não consigo", "acessar"], left: 35, top: 2, width: 37, rotate: 5, tilt: -14, tone: "cyan", delay: 0.15 },
  { icon: "users", title: ["Problemas no", "cadastro e vínculo"], left: 3, top: 46, width: 38, rotate: 10, tilt: 12, tone: "cyan", delay: 0.35 },
  { icon: "doc", title: ["Dificuldades", "nas avaliações"], left: 61, top: 60, width: 38, rotate: -8, tilt: -12, tone: "violet", delay: 0.55 },
];

export function WhatHappened() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40]);

  return (
    <section ref={ref} id="aconteceu" aria-labelledby="aconteceu-title" className="relative isolate overflow-hidden bg-space-950">
      {/* rastros de luz discretos, como na referência */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Starfield density={0.5} drift={false} className="opacity-70" />
        <div className="absolute -bottom-[38%] -left-[10%] h-[70%] w-[75%] rounded-[50%] border-t border-sky-400/30 shadow-[0_-12px_40px_-28px_rgba(56,189,248,.5)] [transform:rotate(-8deg)]" />
        <div className="absolute -top-[30%] left-[18%] h-[45%] w-[40%] rounded-[50%] border-b border-sky-300/15 [transform:rotate(-14deg)]" />
        <div className="absolute right-[10%] top-[20%] h-[60%] w-[40%] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,.16),transparent_65%)] blur-2xl" />
      </div>

      <div className="grid items-center gap-8 px-4 py-20 sm:px-8 sm:py-24 lg:min-h-[max(600px,45.5vw)] lg:grid-cols-[1fr_minmax(0,0.9fr)] lg:gap-[3vw] lg:py-[4vw] lg:pl-[7vw] lg:pr-[3vw]">
        {/* ——— Texto ——— */}
        <div className="max-w-[640px] lg:max-w-[44vw]">
          <Reveal>
            <p className="eyebrow mb-5 text-[#5eead4] lg:!text-[clamp(0.72rem,0.9vw,1rem)]">Contexto</p>
            <h2 id="aconteceu-title" className="text-[2.7rem] font-bold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl lg:text-[clamp(3rem,4.7vw,5.4rem)]">
              {whatHappened.title[0]} <span style={gradientText}>{whatHappened.title[1]}</span>
            </h2>
          </Reveal>
          <div className="mt-7 space-y-6 lg:mt-[2.4vw]">
            {whatHappened.body.map((p, i) => (
              <Reveal key={i} delay={0.1 + i * 0.1}>
                <p className="text-[1.05rem] leading-[1.6] text-[#c3cae0] lg:text-[clamp(1rem,1.24vw,1.4rem)] lg:leading-[1.62]">{p}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ——— Ilustração: planeta, órbitas e cards ——— */}
        <motion.div style={{ y: artY }} className="relative mx-auto aspect-[790/560] w-full max-w-[760px] lg:max-w-none" role="img" aria-label={whatHappened.alt}>
          <IssueOrbit reduce={!!reduce} />
          {issueCards.map((c) => (
            <IssueCard key={c.icon} {...c} reduce={!!reduce} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function IssueOrbit({ reduce }: { reduce: boolean }) {
  // centro do planeta na referência: 42% × 52% do quadro
  const spin = (dur: number, dir = 1) =>
    reduce ? undefined : { animate: { rotate: 360 * dir }, transition: { duration: dur, repeat: Infinity, ease: "linear" as const } };
  const dots = (n: number, colors: string[]) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + 0.4;
      const c = colors[i % colors.length];
      return (
        <span
          key={i}
          className="absolute h-[2.2%] w-[2.2%] min-h-[6px] min-w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%`, background: c, boxShadow: `0 0 12px 3px ${c}aa` }}
        />
      );
    });
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute left-[42%] top-[52%] h-[70%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.35),transparent_62%)] blur-2xl" />

      {/* órbita larga (elipse inclinada) com pontos que correm por ela */}
      <div className="absolute left-[42%] top-[52%] aspect-square w-[66%] [transform:translate(-50%,-50%)_rotate(-14deg)_scaleY(.62)]">
        <div className="absolute inset-0 rounded-full border border-sky-300/40 shadow-[0_0_24px_rgba(56,189,248,.25)]" />
        <motion.div className="absolute inset-0" {...spin(38)}>
          {dots(5, ["#7dd3fc", "#a78bfa", "#7dd3fc", "#60a5fa", "#c4b5fd"])}
        </motion.div>
      </div>
      {/* órbita fina e achatada */}
      <div className="absolute left-[42%] top-[52%] aspect-square w-[46%] [transform:translate(-50%,-50%)_rotate(-8deg)_scaleY(.26)]">
        <div className="absolute inset-0 rounded-full border border-sky-300/50" />
        <motion.div className="absolute inset-0" {...spin(20, -1)}>
          {dots(3, ["#e0f2fe", "#7dd3fc"])}
        </motion.div>
      </div>
      {/* órbita tracejada externa */}
      <motion.svg viewBox="0 0 100 100" className="absolute left-[42%] top-[52%] aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 opacity-60" {...spin(140)}>
        <ellipse cx="50" cy="50" rx="49" ry="33" fill="none" stroke="rgba(125,211,252,.35)" strokeWidth=".25" strokeDasharray="1 1.5" transform="rotate(-12 50 50)" />
      </motion.svg>

      {/* planeta */}
      <motion.div
        className="absolute left-[42%] top-[52%] aspect-square w-[29%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{
          background: "radial-gradient(circle at 36% 30%, #9ad8ff 0%, #3b8cff 26%, #1d4ed8 52%, #0c1a5a 82%, #050b2e 100%)",
          boxShadow: "0 0 70px 14px rgba(59,130,246,.45), 0 0 160px 40px rgba(37,99,235,.22), inset -18px -22px 50px rgba(2,6,23,.6), inset 6px 6px 24px rgba(186,230,253,.35)",
        }}
        animate={reduce ? undefined : { scale: [1, 1.025, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* faixas atmosféricas girando devagar */}
        <motion.div
          className="absolute inset-[-20%] opacity-40 mix-blend-screen"
          style={{
            background:
              "repeating-linear-gradient(170deg, transparent 0 9%, rgba(186,230,253,.35) 10%, transparent 13%), radial-gradient(40% 25% at 30% 60%, rgba(186,230,253,.4), transparent 70%)",
          }}
          animate={reduce ? undefined : { x: ["-6%", "6%", "-6%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* luas */}
      {[
        { left: 16.5, top: 17, size: 6.2, delay: 0 },
        { left: 87, top: 52, size: 5.6, delay: 1.5 },
      ].map((m, i) => (
        <motion.span
          key={i}
          className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: `${m.size}%`,
            background: "radial-gradient(circle at 35% 30%, #4b6fb8, #1e2f6b 55%, #0a1033)",
            boxShadow: "0 0 18px rgba(96,165,250,.35)",
          }}
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: m.delay }}
        />
      ))}
    </div>
  );
}

function IssueCard({
  icon,
  title,
  left,
  top,
  width,
  rotate,
  tilt,
  tone,
  delay,
  reduce,
}: (typeof issueCards)[number] & { reduce: boolean }) {
  const t =
    tone === "violet"
      ? { border: "rgba(167,139,250,.55)", glow: "rgba(139,92,246,.35)", icon: "#c4b5fd", iconBg: "rgba(139,92,246,.25)", dot: "#c4b5fd" }
      : { border: "rgba(125,211,252,.5)", glow: "rgba(56,189,248,.3)", icon: "#bae6fd", iconBg: "rgba(56,189,248,.18)", dot: "#7dd3fc" };
  return (
    <motion.div
      className="absolute [perspective:900px]"
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%` }}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 6 + delay * 4, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
      >
        <div
          className="relative flex aspect-[300/205] items-start gap-[7%] rounded-[clamp(12px,1.3vw,20px)] p-[7%] backdrop-blur-[3px]"
          style={{
            transform: `rotateY(${tilt}deg) rotateZ(${rotate}deg)`,
            background: "linear-gradient(160deg, rgba(125,180,255,.22), rgba(40,70,160,.16) 50%, rgba(12,22,64,.34))",
            border: `1px solid ${t.border}`,
            boxShadow: `0 0 32px -4px ${t.glow}, inset 0 1px 0 rgba(255,255,255,.14), 0 30px 60px -30px rgba(0,0,0,.8)`,
          }}
        >
          {/* pontos de luz nos cantos */}
          <span className="absolute -right-[3px] -top-[3px] h-2 w-2 rounded-full" style={{ background: t.dot, boxShadow: `0 0 10px 3px ${t.dot}` }} />
          <span className="absolute -bottom-[3px] -left-[3px] h-2 w-2 rounded-full" style={{ background: t.dot, boxShadow: `0 0 10px 3px ${t.dot}` }} />
          <span
            className="grid aspect-square w-[24%] shrink-0 place-items-center rounded-full"
            style={{ background: t.iconBg, border: `1px solid ${t.border}`, color: t.icon, boxShadow: `0 0 18px ${t.glow}` }}
          >
            <CardGlyph icon={icon} />
          </span>
          <div className="min-w-0 flex-1 pt-[3%]">
            <p className="whitespace-nowrap text-[clamp(0.66rem,1vw,1.2rem)] font-medium leading-[1.3] text-white">
              {title[0]}
              <br />
              {title[1]}
            </p>
            <div className="mt-[10%] space-y-[6%]" aria-hidden="true">
              <span className="block h-[clamp(3px,0.3vw,5px)] w-[88%] rounded-full bg-sky-200/20" />
              <span className="block h-[clamp(3px,0.3vw,5px)] w-[74%] rounded-full bg-sky-200/15" />
              <span className="block h-[clamp(3px,0.3vw,5px)] w-[52%] rounded-full bg-sky-200/10" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardGlyph({ icon }: { icon: CardIcon }) {
  const cls = "h-[46%] w-[46%]";
  if (icon === "lock")
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
        <path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="5" y="10.5" width="14" height="10.5" rx="2.4" fill="currentColor" />
        <circle cx="12" cy="15.2" r="1.5" fill="#0b1230" />
        <path d="M12 16v2" stroke="#0b1230" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  if (icon === "users")
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
        <circle cx="9" cy="8" r="3.4" fill="currentColor" />
        <circle cx="16.5" cy="9" r="2.7" fill="currentColor" opacity=".85" />
        <path d="M2.5 19.5c.6-3.6 3.2-5.6 6.5-5.6s5.9 2 6.5 5.6z" fill="currentColor" />
        <path d="M15.8 14.2c2.8 0 5 1.6 5.7 4.8h-4.4c-.2-1.9-.7-3.4-1.3-4.8z" fill="currentColor" opacity=".85" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
      <path d="M6 2.5h8.5l4.5 4.5v14.5H6z" fill="currentColor" />
      <path d="M14.5 2.5V7H19" fill="rgba(255,255,255,.4)" />
      <path d="M8.5 11h8M8.5 14h8M8.5 17h5.5" stroke="#1e1b4b" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ———————————————— Olimpíadas / Zerando a PLEI ———————————————— */

type NodeIcon = "users" | "id" | "clipboard" | "shield" | "chart";

/** Ícones em órbita: ângulo inicial (graus) medido na referência. */
const nodes: { icon: NodeIcon; angle: number; tone: "cyan" | "violet"; label: string }[] = [
  { icon: "id", angle: -138, tone: "cyan", label: "Estudantes" },
  { icon: "users", angle: -52, tone: "violet", label: "Turmas" },
  { icon: "clipboard", angle: -3, tone: "cyan", label: "Avaliações" },
  { icon: "chart", angle: 63, tone: "violet", label: "Resultados" },
  { icon: "shield", angle: 148, tone: "cyan", label: "Segurança" },
];

const toneStyle = {
  cyan: { ring: "rgba(56,189,248,.75)", glow: "rgba(56,189,248,.45)", icon: "#7dd3fc" },
  violet: { ring: "rgba(167,139,250,.75)", glow: "rgba(139,92,246,.45)", icon: "#a78bfa" },
};

export function Olympics() {
  const reduce = useReducedMotion();
  // raios em % do quadro (referência: planeta 75px, anel interno 135px, anel dos ícones 183px, arco externo 260px num quadro de ~560px)
  const R_NODES = 35;
  return (
    <section aria-labelledby="olimpiadas-title" className="relative overflow-hidden bg-space-950 py-16 sm:py-20 lg:py-8">
      <div className="grid items-center gap-10 px-4 sm:px-8 lg:grid-cols-[49%_1fr] lg:gap-0 lg:pl-0 lg:pr-[5.5vw]">
        {/* ——— Órbitas ——— */}
        <Reveal className="relative mx-auto aspect-square w-full max-w-[480px] lg:w-[34vw] lg:max-w-[560px]" aria-hidden="true">
          <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.28),transparent_70%)] blur-2xl" />

          {/* arco externo tracejado */}
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          >
            <path d="M 4.5 44 A 46 46 0 0 0 78 90" fill="none" stroke="rgba(125,211,252,.35)" strokeWidth=".35" strokeDasharray="1.2 1.4" />
            <path d="M 60 2.6 A 48 48 0 0 1 96 30" fill="none" stroke="rgba(167,139,250,.22)" strokeWidth=".3" strokeDasharray="1 1.6" />
          </motion.svg>

          {/* anel interno com pontos de luz (sentido anti-horário) */}
          <div className="absolute inset-[24%] rounded-full border border-sky-300/20">
            <motion.div
              className="absolute inset-0"
              animate={reduce ? undefined : { rotate: -360 }}
              transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
            >
              {[20, 110, 200, 290].map((a, i) => (
                <OrbitDot key={a} angle={a} radius={50} color={i % 2 ? "#a78bfa" : "#38bdf8"} />
              ))}
            </motion.div>
          </div>

          {/* anel dos ícones (sentido horário; ícones contra-giram para ficar em pé) */}
          <div className="absolute rounded-full border border-sky-300/[0.18]" style={{ inset: `${50 - R_NODES}%` }}>
            <motion.div
              className="absolute inset-0"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            >
              {[75, 165, 250, 330].map((a, i) => (
                <OrbitDot key={a} angle={a} radius={50} color={i % 2 ? "#38bdf8" : "#a78bfa"} small />
              ))}
              {nodes.map((n, i) => (
                <OrbitNode key={n.icon} {...n} reduce={!!reduce} index={i} />
              ))}
            </motion.div>
          </div>

          {/* pontos soltos ao redor */}
          {[
            [10, 26],
            [8, 64],
            [90, 30],
            [92, 76],
            [28, 90],
            [60, 97],
          ].map(([x, y], i) => (
            <span
              key={i}
              className="twinkle absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                background: i % 2 ? "#a78bfa" : "#38bdf8",
                boxShadow: `0 0 10px 2px ${i % 2 ? "rgba(167,139,250,.6)" : "rgba(56,189,248,.6)"}`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}

          {/* planeta PLEI */}
          <motion.div
            className="absolute left-1/2 top-1/2 grid h-[29%] w-[29%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
            style={{
              background: "radial-gradient(circle at 34% 28%, #8fd3ff 0%, #3b82f6 32%, #1d4ed8 58%, #172554 100%)",
              boxShadow: "0 0 60px 10px rgba(59,130,246,.45), 0 0 140px 30px rgba(37,99,235,.25), inset -14px -18px 40px rgba(2,6,23,.55)",
            }}
            animate={reduce ? undefined : { scale: [1, 1.035, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="font-mono text-[clamp(0.8rem,1.4vw,1.15rem)] font-semibold tracking-[0.3em] text-white/95">PLEI</span>
          </motion.div>
        </Reveal>

        {/* ——— Texto ——— */}
        <div>
          <Reveal>
            <p className="eyebrow mb-4 text-[#a78bfa]">{olympics.eyebrow}</p>
            <h2 id="olimpiadas-title" className="text-[2.1rem] font-bold leading-[1.1] tracking-[-0.03em] sm:text-5xl lg:text-[clamp(2.2rem,2.9vw,3.3rem)]">
              <span className="block text-white">{olympics.title[0]}</span>{" "}
              <span className="block" style={gradientText}>
                {olympics.title[1]}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-[640px] text-[1.05rem] leading-[1.6] text-[#b9c2de] lg:max-w-[44vw] lg:text-[clamp(1rem,1.2vw,1.22rem)]">{olympics.body}</p>
          </Reveal>
          <Reveal delay={0.22}>
            <motion.p
              className="mt-8 border-l-2 border-[#38bdf8] pl-6 text-[1.08rem] font-medium leading-[1.55] text-white lg:text-[clamp(1.02rem,1.25vw,1.22rem)]"
              initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ clipPath: "inset(0 0% 0 0)" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
            >
              {olympics.closing[0]}
              <br />
              {olympics.closing[1]}
            </motion.p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function OrbitDot({ angle, radius, color, small }: { angle: number; radius: number; color: string; small?: boolean }) {
  const a = (angle * Math.PI) / 180;
  const size = small ? 5 : 7;
  return (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        left: `${50 + radius * Math.cos(a)}%`,
        top: `${50 + radius * Math.sin(a)}%`,
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 10px 2px ${color}99`,
      }}
    />
  );
}

function OrbitNode({
  icon,
  angle,
  tone,
  label,
  reduce,
  index,
}: {
  icon: NodeIcon;
  angle: number;
  tone: "cyan" | "violet";
  label: string;
  reduce: boolean;
  index: number;
}) {
  const a = (angle * Math.PI) / 180;
  const t = toneStyle[tone];
  return (
    <span
      className="absolute h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%` }}
      title={label}
    >
      {/* contra-rotação: o ícone permanece em pé enquanto o anel gira */}
      <motion.span
        className="grid h-full w-full place-items-center rounded-full backdrop-blur-sm"
        style={{
          background: "radial-gradient(circle at 50% 35%, rgba(30,41,90,.9), rgba(8,12,34,.92))",
          border: `1.5px solid ${t.ring}`,
          boxShadow: `0 0 22px 2px ${t.glow}, inset 0 0 16px ${t.glow}`,
          color: t.icon,
        }}
        animate={reduce ? undefined : { rotate: -360, scale: [1, 1.06, 1] }}
        transition={{
          rotate: { duration: 90, repeat: Infinity, ease: "linear" },
          scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.6 },
        }}
      >
        <NodeGlyph icon={icon} />
      </motion.span>
    </span>
  );
}

function NodeGlyph({ icon }: { icon: NodeIcon }) {
  const cls = "h-[42%] w-[42%]";
  if (icon === "id")
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
        <circle cx="12" cy="8" r="4.2" fill="currentColor" />
        <path d="M4 20.5c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5z" fill="currentColor" />
      </svg>
    );
  if (icon === "users")
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
        <circle cx="12" cy="7.5" r="3.3" fill="currentColor" />
        <circle cx="5.5" cy="9" r="2.5" fill="currentColor" opacity=".85" />
        <circle cx="18.5" cy="9" r="2.5" fill="currentColor" opacity=".85" />
        <path d="M6.5 19c.5-3.4 2.8-5.3 5.5-5.3s5 1.9 5.5 5.3z" fill="currentColor" />
        <path d="M1.5 18c.3-2.5 1.8-3.9 4-3.9 1 0 1.8.3 2.5.8-1 1-1.6 2-1.9 3.1zM22.5 18c-.3-2.5-1.8-3.9-4-3.9-1 0-1.8.3-2.5.8 1 1 1.6 2 1.9 3.1z" fill="currentColor" opacity=".85" />
      </svg>
    );
  if (icon === "clipboard")
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
        <path d="M6 2.5h8.5l4.5 4.5v14.5H6z" fill="currentColor" />
        <path d="M14.5 2.5V7H19" fill="rgba(255,255,255,.35)" />
        <path d="M8.5 11h8M8.5 14h8M8.5 17h5.5" stroke="#0b1230" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  if (icon === "shield")
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
        <path d="M12 2.5 20 6v6c0 4.8-3.4 8.6-8 9.5-4.6-.9-8-4.7-8-9.5V6z" fill="currentColor" />
        <path d="m8.3 12.2 2.6 2.6 4.9-5.2" fill="none" stroke="#0b1230" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
      <rect x="4" y="13" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="10" y="8.5" width="4" height="12.5" rx="1" fill="currentColor" />
      <rect x="16" y="4" width="4" height="17" rx="1" fill="currentColor" />
    </svg>
  );
}

