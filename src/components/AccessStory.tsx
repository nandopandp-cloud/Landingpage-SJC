import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { accessStory, type AccessStep } from "../data/content";
import { ClassroomVisual, LimitVisual, MigrationVisual, SearchVisual, ShieldVisual } from "./AccessVisuals";
import { CertaintyBadge, Reveal, SectionHeader } from "./ui";

const visuals = {
  search: SearchVisual,
  migration: MigrationVisual,
  classroom: ClassroomVisual,
  limit: LimitVisual,
  shield: ShieldVisual,
} as const;

function Visual({ step, active }: { step: AccessStep; active: boolean }) {
  const V = visuals[step.visual];
  return <V active={active} />;
}

export function AccessStory() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.idx));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <section id="acesso" aria-labelledby="acesso-title" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_80%_10%,rgba(99,102,241,.14),transparent_70%)]" />
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            id="acesso-title"
            eyebrow="Por que aconteceu"
            title="O problema por trás do acesso"
            lede="Identificamos diferentes fatores que contribuíram para os problemas de acesso. Em cinco etapas: o que encontramos, o que ainda é hipótese e o que fizemos."
          />
          {/* atalhos para as etapas */}
          <Reveal className="snap-row -mx-4 gap-2 px-4 lg:mx-0 lg:max-w-[46%] lg:flex-wrap lg:justify-end lg:px-0">
            {accessStory.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-current={active === i ? "step" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[0.8rem] transition ${
                  active === i ? "border-cyan/40 bg-cyan/10 text-ink" : "border-white/10 text-ink-3 hover:border-white/25 hover:text-ink-2"
                }`}
              >
                <span className="font-mono text-[0.7rem]">{s.n}</span>
                {s.tab}
              </button>
            ))}
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          {/* etapas (texto) */}
          <div className="relative min-w-0">
            <div aria-hidden="true" className="absolute bottom-0 left-[15px] top-0 hidden w-px bg-white/10 lg:block">
              <motion.div
                className="w-full origin-top bg-gradient-to-b from-cyan to-violet"
                animate={{ height: `${((active + 1) / accessStory.length) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            {accessStory.map((s, i) => (
              <article
                key={s.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-idx={i}
                aria-labelledby={`etapa-${s.id}`}
                className="relative flex flex-col justify-center py-10 lg:min-h-[78vh] lg:py-16 lg:pl-14"
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 hidden h-[31px] w-[31px] -translate-y-1/2 place-items-center rounded-full border font-mono text-[0.66rem] transition-colors duration-500 lg:grid ${
                    active >= i ? "border-cyan/60 bg-space-900 text-cyan" : "border-white/15 bg-space-900 text-ink-3"
                  }`}
                >
                  {s.n}
                </span>
                <Reveal>
                  <p className="eyebrow mb-3 text-cyan lg:hidden">Etapa {s.n}</p>
                  <h3 id={`etapa-${s.id}`} className="headline text-[1.7rem] text-ink sm:text-[2.2rem]">
                    {s.title}
                  </h3>
                  <p className="lede mt-4 text-[1.05rem] leading-relaxed text-ink-2 sm:text-lg">{s.lead}</p>
                </Reveal>
                <div className="mt-6 space-y-3">
                  {s.blocks.map((b, bi) => (
                    <Reveal key={bi} delay={0.05 * bi}>
                      <div
                        className={`rounded-2xl border p-4 sm:p-5 ${
                          b.kind === "hipotese"
                            ? "border-amber-300/25 bg-amber-400/[0.06]"
                            : b.kind === "acao"
                              ? "border-emerald-300/20 bg-emerald-400/[0.05]"
                              : "border-white/8 bg-white/[0.025]"
                        }`}
                      >
                        <CertaintyBadge kind={b.kind} />
                        <p className="mt-2.5 text-[0.98rem] leading-relaxed text-ink">{b.text}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
                {/* visual inline no mobile/tablet */}
                {!isDesktop && (
                  <div className="mt-8 h-[400px] sm:h-[420px]">
                    <Visual step={s} active={active === i} />
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* visual fixo (desktop) */}
          {isDesktop && (
            <div className="relative min-w-0">
              <div className="sticky top-[calc(var(--nav-h)+8vh)] h-[min(72vh,620px)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    className="h-full"
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Visual step={accessStory[active]} active />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
