import {
  AnimatePresence,
  motion,
  motionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { heroBeats, heroChapters, heroMedia, type HeroBeat, type HeroGlow, type HeroTone } from "../data/content";
import { Icon } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Geometria dos frames de referência (design/hero-frames, 1672×941) */
const IMG_W = 1672;
const IMG_H = 941;
const PANEL = { x: 1446, y: 233, w: 200, h: 357 };
const PAUSE = { x: 1546, y: 632, d: 54 };
/** à direita disto, a plate tem a área reconstruída sob o painel: o layout empilhado nunca a mostra */
const PANEL_SAFE_RIGHT = 1432;
/** zoom lento de cada cena ("câmera") */
const KEN_BURNS = 0.045;

type Mode = "stage" | "stacked";
interface Cover {
  s: number;
  x: number;
  y: number;
}

/** Mesma conta do object-fit: cover, mas exposta para posicionar a UI sobre a imagem. */
function computeCover(cw: number, ch: number, mode: Mode, focusX: number): Cover {
  let s = Math.max(cw / IMG_W, ch / IMG_H);
  if (mode === "stacked") s = Math.max(s, cw / PANEL_SAFE_RIGHT);
  const vw = cw / s;
  const left =
    mode === "stage"
      ? Math.max(0, IMG_W - vw) // alinhado à direita: o painel fica sempre visível
      : Math.min(Math.max(0, focusX * IMG_W - vw / 2), Math.max(0, PANEL_SAFE_RIGHT - vw));
  const fy = mode === "stage" ? 0.5 : 0.92;
  return { s, x: -left * s, y: (ch - IMG_H * s) * fy };
}

const tones: Record<HeroTone, { eyebrow: string; gradient: string; ring: string; row: string; particle: string }> = {
  journey: {
    eyebrow: "#5eead4",
    gradient: "linear-gradient(100deg,#67e8f9 0%,#7dd3fc 55%,#a5b4fc 100%)",
    ring: "#5eead4",
    row: "linear-gradient(90deg,rgba(45,212,191,.42),rgba(45,212,191,.06))",
    particle: "165,243,252",
  },
  challenge: {
    eyebrow: "#fb7185",
    gradient: "linear-gradient(100deg,#fda4af 0%,#f472b6 60%,#f9a8d4 100%)",
    ring: "#fb7185",
    row: "linear-gradient(90deg,rgba(251,113,133,.3),rgba(251,113,133,.08))",
    particle: "253,164,175",
  },
  action: {
    eyebrow: "#67e8f9",
    gradient: "linear-gradient(100deg,#67e8f9 0%,#38bdf8 60%,#7dd3fc 100%)",
    ring: "#38bdf8",
    row: "linear-gradient(90deg,rgba(56,189,248,.36),rgba(56,189,248,.08))",
    particle: "125,211,252",
  },
  stable: {
    eyebrow: "#67e8f9",
    gradient: "linear-gradient(100deg,#5eead4 0%,#67e8f9 55%,#99f6e4 100%)",
    ring: "#5eead4",
    row: "linear-gradient(90deg,rgba(20,184,166,.52),rgba(20,184,166,.26))",
    particle: "153,246,228",
  },
  evolve: {
    eyebrow: "#67e8f9",
    gradient: "linear-gradient(100deg,#5eead4 0%,#67e8f9 50%,#7dd3fc 100%)",
    ring: "#67e8f9",
    row: "linear-gradient(90deg,rgba(148,163,184,.28),rgba(148,163,184,.12))",
    particle: "254,240,200",
  },
};

export function Hero() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [finished, setFinished] = useState(false);
  const [videoOk, setVideoOk] = useState(heroMedia.videoEnabled);
  const [mode, setMode] = useState<Mode>("stage");
  const [cover, setCover] = useState<Cover | null>(null);
  const progress = useMotionValue(0);
  const zooms = useMemo(() => heroBeats.map(() => motionValue(1)), []);
  const sectionRef = useRef<HTMLElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visibleRef = useRef(true);
  const current = heroBeats[beat];
  const tone = tones[current.tone];

  // "stage" (paisagem ≥1024px) replica o frame; "stacked" empilha texto e arte
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const area = areaRef.current;
    if (!section || !area) return;
    const measure = () => {
      const w = section.clientWidth;
      const h = section.clientHeight;
      const m: Mode = w >= 1024 && w / h >= 1.45 ? "stage" : "stacked";
      setMode(m);
      setCover(computeCover(w, m === "stage" ? h : area.clientHeight, m, heroBeats[beat].focusX));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(area);
    return () => ro.disconnect();
  }, [beat, mode]);

  // Relógio da narrativa: rAF → motion values (sem re-render por quadro)
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (visibleRef.current && !document.hidden) {
        const next = progress.get() + dt / heroBeats[beat].duration;
        if (next >= 1) {
          if (beat === heroBeats.length - 1) {
            progress.set(1);
            setPlaying(false);
            setFinished(true);
            return;
          }
          progress.set(0);
          setBeat((b) => b + 1);
          return;
        }
        progress.set(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, beat, progress]);

  // Zoom lento acompanha o relógio (e pausa junto com ele)
  useMotionValueEvent(progress, "change", (p) => {
    if (!reduce) zooms[beat].set(1 + KEN_BURNS * p);
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (visibleRef.current = e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoOk) return;
    if (playing) v.play().catch(() => setVideoOk(false));
    else v.pause();
  }, [playing, videoOk]);

  const goTo = useCallback(
    (idx: number) => {
      progress.set(0);
      zooms[idx].set(1);
      setBeat(idx);
      setFinished(false);
      if (videoRef.current && videoOk) {
        videoRef.current.currentTime = heroBeats.slice(0, idx).reduce((s, b) => s + b.duration, 0) / 1000;
      }
    },
    [progress, videoOk, zooms],
  );

  // a cena que entra sempre começa sem zoom; a que sai mantém o zoom enquanto desaparece
  const prevBeat = useRef(beat);
  useEffect(() => {
    if (prevBeat.current !== beat) zooms[beat].set(1);
    prevBeat.current = beat;
  }, [beat, zooms]);

  const togglePlay = () => {
    if (finished) {
      goTo(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  const stage = mode === "stage";
  // No modo "stage" o bloco de texto ocupa a faixa x=102…735 da imagem, como no frame.
  // Em telas mais estreitas que 16:9 a imagem perde um pedaço da esquerda: o texto encolhe
  // o suficiente para continuar terminando antes dos cards e do personagem.
  const TEXT_L = 102;
  const TEXT_R = 735;
  const textLeft = stage && cover ? Math.max(cover.x + TEXT_L * cover.s, 28) : 0;
  const k = stage && cover ? Math.min(cover.s, (cover.x + TEXT_R * cover.s - textLeft) / (TEXT_R - TEXT_L)) : 1;
  const textTop = stage && cover ? cover.y : 0;
  const playLabel = finished ? "Rever a abertura" : playing ? "Pausar a animação de abertura" : "Reproduzir a animação de abertura";

  return (
    <section
      ref={sectionRef}
      id="inicio"
      aria-roledescription="apresentação"
      aria-label="Abertura: a jornada PLEI"
      className="relative isolate flex h-[100svh] min-h-[640px] max-h-[1240px] w-full overflow-hidden bg-space-950"
      style={{ "--k": k } as CSSProperties}
    >
      <h1 className="sr-only">
        PLEI Exploradores. Prestação de contas: tivemos uma semana fora da normalidade. Entendemos o que aconteceu, agimos para resolver e
        transformamos os aprendizados em melhorias estruturais.
      </h1>

      {/* ——— Arte ——— */}
      <div ref={areaRef} className={`absolute -z-10 overflow-hidden ${stage ? "inset-0" : "inset-x-0 bottom-0 h-[60%] sm:h-[58%]"}`}>
        {videoOk ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={heroMedia.video}
            poster={heroMedia.poster}
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            onError={() => setVideoOk(false)}
          />
        ) : (
          cover && (
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: IMG_W,
                height: IMG_H,
                transform: `translate3d(${cover.x}px, ${cover.y}px, 0) scale(${cover.s})`,
                transition: stage || reduce ? undefined : "transform 1.4s cubic-bezier(.16,1,.3,1)",
              }}
            >
              {heroBeats.map((b, i) => (
                <Plate key={b.plate} beat={b} index={i} active={i === beat} zoom={zooms[i]} stage={stage} reduce={!!reduce} />
              ))}
              {stage && (
                <ChapterPanel
                  beat={beat}
                  finished={finished}
                  progress={progress}
                  onSelect={goTo}
                  onToggle={togglePlay}
                  playing={playing}
                  playLabel={playLabel}
                />
              )}
            </div>
          )
        )}
        <Particles tone={current.tone} reduce={!!reduce} />
        {!stage && (
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-space-950 via-space-950/70 to-transparent" />
        )}
      </div>

      {/* véus de legibilidade (a arte já é escura à esquerda; isto só garante contraste) */}
      {stage ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,5,18,.52)_0%,rgba(3,5,18,.28)_30%,rgba(3,5,18,0)_50%)]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-space-950/60 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-space-900 to-transparent" />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[55%] bg-[radial-gradient(90%_70%_at_20%_0%,rgba(79,70,229,.22),transparent_70%)]"
        />
      )}

      {/* ——— Texto ——— */}
      <div
        className={`pointer-events-none relative z-10 flex w-full flex-col [&>*]:pointer-events-auto ${
          stage ? "pr-[34vw]" : "px-5 pt-[calc(var(--nav-h)+4vh)] sm:px-8"
        }`}
        style={stage ? { paddingLeft: textLeft, paddingTop: Math.max(textTop, 0) } : undefined}
      >
        <div aria-live={playing ? "off" : "polite"} aria-atomic="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={beat}
              style={stage && cover ? { marginTop: current.layout.top * cover.s + Math.min(textTop, 0) } : undefined}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -8, transition: { duration: 0.4 } }}
            >
              <motion.p
                className={`font-mono font-medium uppercase ${
                  stage ? "mb-[calc(22px*var(--k))] text-[max(11px,calc(13.5px*var(--k)))] tracking-[0.32em]" : "mb-4 text-[0.72rem] tracking-[0.28em]"
                }`}
                style={{ color: tone.eyebrow }}
                initial={reduce ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                {current.eyebrow}
              </motion.p>

              <p
                className={`font-bold tracking-[-0.035em] ${stage ? "leading-[0.99]" : "text-[2.35rem] leading-[1.04] sm:text-[3.2rem]"}`}
                style={stage ? { fontSize: current.layout.title * k } : undefined}
              >
                {current.lines.map((line, i) => (
                  <span key={line} className="block overflow-hidden pb-[0.07em]">
                    <motion.span
                      className="block"
                      style={
                        i === 0
                          ? { color: "#fff" }
                          : { backgroundImage: tone.gradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
                      }
                      initial={reduce ? false : { y: "108%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 1.05, delay: 0.1 + i * 0.13, ease: EASE }}
                    >
                      {line}
                    </motion.span>{" "}
                  </span>
                ))}
              </p>

              {current.sub && (
                <motion.p
                  className={`text-[#dde3f5] ${stage ? "mt-[calc(22px*var(--k))] text-[max(17px,calc(28px*var(--k)))] leading-[1.25]" : "mt-4 text-lg leading-snug sm:text-xl"}`}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
                >
                  {current.sub.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </motion.p>
              )}
              {current.body && (
                <motion.p
                  className={`text-[#c9d0e6] ${
                    stage ? "mt-[calc(20px*var(--k))] text-[max(14.5px,calc(19.5px*var(--k)))] leading-[1.34]" : "mt-4 max-w-md text-[0.98rem] leading-relaxed sm:text-[1.05rem]"
                  }`}
                  style={stage ? { maxWidth: (current.layout.bodyWidth ?? 440) * Math.max(k, 14.5 / 19.5) } : undefined}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
                >
                  {current.body}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={`items-center ${stage ? "mt-[calc(32px*var(--k))] flex gap-[calc(18px*var(--k))]" : "mt-6 hidden gap-4 sm:flex"}`}>
          <a
            href="#aconteceu"
            className={`group inline-flex items-center rounded-full bg-white font-semibold text-[#0b1230] shadow-[0_10px_30px_-10px_rgba(255,255,255,.45)] transition hover:bg-[#eef4ff] ${
              stage ? "h-[max(42px,calc(52px*var(--k)))] gap-[calc(12px*var(--k))] px-[calc(24px*var(--k))] text-[max(13px,calc(16px*var(--k)))]" : "h-12 gap-3 px-5 text-[0.95rem]"
            }`}
          >
            Explorar os detalhes
            <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          {/* <span aria-hidden="true" className={`w-px bg-white/35 ${stage ? "h-[calc(18px*var(--k))]" : "h-4"}`} />
          <span className={`text-[#aeb7d3] ${stage ? "text-[max(12px,calc(15px*var(--k)))]" : "text-sm"}`}>Relatório de ocorrências · 2026</span> */}
        </div>
      </div>

      {/* ——— Controles no layout empilhado ——— */}
      {!stage && (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-space-950/90 via-space-950/50 to-transparent pt-10">
          <div className="flex items-center gap-3 px-4 pb-5 sm:px-8">
            <ol className="flex flex-1 gap-1.5" aria-label="Capítulos da jornada">
              {heroChapters.map((c, i) => {
                const active = i === beat;
                const done = i < beat || finished;
                return (
                  <li key={c.n} className="flex-1">
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={active ? "step" : undefined}
                      aria-label={`Capítulo ${c.n}: ${c.label}`}
                      className="flex w-full flex-col gap-2 text-left"
                    >
                      <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/20">
                        <BarFill
                          key={`${beat}${active}${done}`}
                          active={active}
                          done={done}
                          progress={progress}
                          color={tones[heroBeats[i].tone].ring}
                        />
                      </span>
                      <span className={`text-[0.68rem] font-medium leading-tight sm:text-xs ${active ? "text-white" : "text-white/60"}`}>
                        {String(c.n).padStart(2, "0")} {c.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playLabel}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-[#1b2144]/70 text-white backdrop-blur-md"
            >
              <PlayGlyph finished={finished} playing={playing} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ———————————————— Plate de cada cena ———————————————— */

function Plate({
  beat,
  index,
  active,
  zoom,
  stage,
  reduce,
}: {
  beat: HeroBeat;
  index: number;
  active: boolean;
  zoom: MotionValue<number>;
  stage: boolean;
  reduce: boolean;
}) {
  // no desktop o zoom parte do centro do painel, para a plate nunca "escorregar" sob ele
  const origin = stage
    ? `${((PANEL.x + PANEL.w / 2) / IMG_W) * 100}% ${((PANEL.y + PANEL.h / 2) / IMG_H) * 100}%`
    : `${beat.focusX * 100}% 75%`;
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: active ? 1 : 0, filter: active || reduce ? "blur(0px)" : "blur(6px)" }}
      transition={{ duration: reduce ? 0 : 1.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ scale: zoom, transformOrigin: origin, zIndex: active ? 2 : 1 }}
    >
      <img
        src={`${beat.plate}.webp`}
        alt={active ? beat.alt : ""}
        aria-hidden={active ? undefined : true}
        width={IMG_W}
        height={IMG_H}
        draggable={false}
        decoding="async"
        fetchPriority={index === 0 ? "high" : "low"}
        className="absolute inset-0 h-full w-full select-none"
      />
      {!reduce && active && beat.glows.map((g, i) => <Glow key={i} glow={g} delay={0.5 + i * 0.35} />)}
    </motion.div>
  );
}

/** Brilho que "acende" cada card da arte em sequência e depois respira. */
function Glow({ glow, delay }: { glow: HeroGlow; delay: number }) {
  const { x, y, w, h, color, kind = "card" } = glow;
  const shape =
    kind === "beam"
      ? `linear-gradient(90deg, transparent, rgba(${color},.9) 50%, transparent)`
      : kind === "sun"
        ? `radial-gradient(closest-side, rgba(${color},.85), rgba(${color},.25) 45%, transparent 75%)`
        : `radial-gradient(closest-side, rgba(${color},.55), rgba(${color},.18) 55%, transparent 80%)`;
  const peak = kind === "card" ? 0.7 : 0.9;
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ left: x - w / 2, top: y - h / 2, width: w, height: h, background: shape, mixBlendMode: "screen" }}
      initial={{ opacity: 0, scale: kind === "beam" ? 1 : 0.85 }}
      animate={{
        opacity: [0, peak, peak * 0.35, peak * 0.75, peak * 0.35],
        scale: kind === "beam" ? [1, 1, 1.04, 1, 1.04] : [0.85, 1.05, 1, 1.03, 1],
      }}
      transition={{ duration: 4.2, delay, times: [0, 0.18, 0.5, 0.75, 1], repeat: Infinity, repeatDelay: 0.2, ease: "easeInOut" }}
    />
  );
}

/** Partículas de poeira estelar subindo devagar (CSS, só transform/opacity). */
function Particles({ tone, reduce }: { tone: HeroTone; reduce: boolean }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const r = (n: number) => (((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1;
        return { left: r(1) * 100, top: 35 + r(2) * 65, size: 1.5 + r(3) * 2.5, dur: 9 + r(4) * 10, delay: -r(5) * 18 };
      }),
    [],
  );
  if (reduce) return null;
  const c = tones[tone].particle;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="hero-dust absolute rounded-full transition-[background-color,box-shadow] duration-1000"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: `rgba(${c},.85)`,
            boxShadow: `0 0 ${d.size * 4}px rgba(${c},.7)`,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ———————————————— Painel de capítulos (réplica do frame, em coordenadas da imagem) ———————————————— */

function ChapterPanel({
  beat,
  finished,
  progress,
  onSelect,
  onToggle,
  playing,
  playLabel,
}: {
  beat: number;
  finished: boolean;
  progress: MotionValue<number>;
  onSelect: (i: number) => void;
  onToggle: () => void;
  playing: boolean;
  playLabel: string;
}) {
  const tone = tones[heroBeats[beat].tone];
  return (
    <>
      <nav
        aria-label="Capítulos da jornada"
        className="absolute z-10 rounded-[20px] border border-white/[0.13] bg-[rgba(22,28,64,.5)] p-[12px] shadow-[0_30px_60px_-30px_rgba(0,0,0,.8),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl"
        style={{ left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h }}
      >
        <ol className="flex h-full flex-col justify-between">
          {heroChapters.map((c, i) => {
            const active = i === beat;
            const done = i < beat || finished;
            return (
              <li key={c.n}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Capítulo ${c.n}: ${c.label}`}
                  className="relative flex h-[62px] w-full items-center gap-[14px] rounded-[14px] px-[12px] text-left"
                >
                  {active && (
                    <motion.span
                      layoutId="chapter-row"
                      className="absolute inset-0 rounded-[14px] border border-white/[0.08]"
                      style={{ background: tone.row }}
                      transition={{ duration: 0.6, ease: EASE }}
                    />
                  )}
                  <span className="relative grid h-[38px] w-[38px] shrink-0 place-items-center font-mono text-[12.5px] text-white/85">
                    <Ring key={`${beat}${active}${done}`} active={active} done={done} progress={progress} color={tone.ring} />
                    {String(c.n).padStart(2, "0")}
                  </span>
                  <span className={`relative text-[16.5px] ${active ? "font-medium text-white" : "text-white/60"}`}>{c.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <button
        type="button"
        onClick={onToggle}
        aria-label={playLabel}
        className="absolute z-10 grid place-items-center rounded-full border border-white/[0.12] bg-[rgba(30,36,78,.72)] text-white shadow-[0_12px_30px_-10px_rgba(0,0,0,.7)] backdrop-blur-md transition hover:bg-[rgba(44,52,110,.8)]"
        style={{ left: PAUSE.x - PAUSE.d / 2, top: PAUSE.y - PAUSE.d / 2, width: PAUSE.d, height: PAUSE.d }}
      >
        <PlayGlyph finished={finished} playing={playing} />
      </button>
    </>
  );
}

function Ring({ active, done, progress, color }: { active: boolean; done: boolean; progress: MotionValue<number>; color: string }) {
  const dash = useTransform(progress, (v) => (done ? 0 : active ? 100 - v * 100 : 92));
  return (
    <svg viewBox="0 0 38 38" className="absolute inset-0 -rotate-90" aria-hidden="true">
      <circle cx="19" cy="19" r="17" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.3" />
      <motion.circle
        cx="19"
        cy="19"
        r="17"
        fill="none"
        stroke={active || done ? color : "rgba(255,255,255,.55)"}
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        style={{ strokeDashoffset: dash, filter: active ? `drop-shadow(0 0 5px ${color})` : undefined }}
      />
    </svg>
  );
}

function BarFill({ active, done, progress, color }: { active: boolean; done: boolean; progress: MotionValue<number>; color: string }) {
  const scale = useTransform(progress, (v) => (done ? 1 : active ? v : 0));
  return <motion.span className="absolute inset-0 origin-left rounded-full" style={{ scaleX: scale, background: color }} />;
}

function PlayGlyph({ finished, playing }: { finished: boolean; playing: boolean }) {
  if (finished)
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return <Icon name={playing ? "pause" : "play"} size={17} />;
}
