import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { timeline } from "../data/content";
import { fmtDate, incidentStats as S } from "../data/incidents";
import { Icon, Reveal, SectionHeader, Starfield } from "./ui";

const icons = ["alert", "search", "spark", "check", "layers"] as const;

export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const line = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0, 1]);

  const evidence = (i: number, text: string) =>
    i === 0 && S.signals.unexpectedErrorFirstSeen ? `${text} ${fmtDate(S.signals.unexpectedErrorFirstSeen)}.` : text;

  return (
    <section aria-labelledby="linha-title" className="relative isolate z-20 -mt-10 overflow-hidden rounded-t-[40px] bg-space-900 py-24 sm:rounded-t-[56px] sm:py-32">
      <Starfield className="-z-10 opacity-70" density={0.6} />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(59,130,246,.18),transparent_70%)]" />
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
        <SectionHeader
          id="linha-title"
          eyebrow="Existe um processo"
          title={
            <>
              Linha do tempo: <span className="text-glow">da identificação à melhoria contínua.</span>
            </>
          }
        />

        <div ref={ref} className="relative mt-16">
          {/* trilho — horizontal no desktop, vertical no mobile */}
          <div aria-hidden="true" className="absolute left-[23px] top-0 h-full w-px bg-white/10 lg:hidden">
            <motion.div className="h-full w-full origin-top bg-gradient-to-b from-cyan via-sky to-stable" style={{ scaleY: line }} />
          </div>
          <div aria-hidden="true" className="absolute left-0 top-[23px] hidden h-px w-full bg-white/10 lg:block">
            <motion.div className="h-full w-full origin-left bg-gradient-to-r from-cyan via-sky to-stable" style={{ scaleX: line }} />
          </div>

          <ol className="relative grid gap-10 lg:grid-cols-5 lg:gap-6">
            {timeline.map((t, i) => (
              <Reveal as="li" key={t.title} delay={i * 0.12} className="relative pl-16 lg:pl-0 lg:pt-16">
                <span className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-space-850 text-cyan shadow-[0_0_30px_rgba(103,232,249,.25)] lg:left-0">
                  <span className="pulse-ring absolute inset-0 rounded-full border border-cyan/30" style={{ animationDelay: `${i * 0.4}s` }} />
                  <Icon name={icons[i]} size={20} className={i === timeline.length - 1 ? "text-stable" : ""} />
                </span>
                <p className="font-mono text-[0.7rem] text-ink-3">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 text-lg font-semibold text-ink">{t.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2">{t.text}</p>
                <p className="mt-3 border-t border-white/8 pt-3 text-xs leading-relaxed text-ink-3">{evidence(i, t.evidence)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
