import { useEffect, useRef, useState } from "react";
import { resolutions, solutions } from "../data/content";
import { fmtInt, fmtPct, incidentStats as S } from "../data/incidents";
import { CertaintyBadge, Icon, Reveal, SectionHeader, StatusBadge } from "./ui";

const catIcon = {
  acesso_credenciais: "key",
  cadastro_alunos: "users",
  avaliacoes: "clipboard",
  profissionais: "id",
  atividades: "book",
} as const;

export function Solutions() {
  const rowRef = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [current, setCurrent] = useState(0);

  const update = () => {
    const el = rowRef.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    const cards = Array.from(el.children) as HTMLElement[];
    const idx = cards.findIndex((c) => c.offsetLeft + c.offsetWidth / 2 > el.scrollLeft + 24);
    setCurrent(Math.max(0, idx));
  };
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 360) + 16), behavior: "smooth" });
  };

  return (
    <section
      aria-labelledby="solucao-title"
      className="on-day relative z-10 -mt-10 rounded-t-[40px] bg-day pb-24 pt-20 text-day-ink sm:rounded-t-[56px] sm:pb-32 sm:pt-28"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            id="solucao-title"
            tone="day"
            eyebrow="O que fizemos"
            title={
              <>
                Do problema <span className="text-glow-day">à solução.</span>
              </>
            }
            lede="Para cada tema: o problema relatado, o que identificamos, o que fizemos e como estamos trabalhando para evitar a recorrência."
          />
          <div className="flex items-center gap-2 self-end">
            <span className="mr-2 text-sm text-day-ink-3 tabular" aria-live="polite">
              {current + 1} / {solutions.length}
            </span>
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={edge.start}
              aria-label="Tema anterior"
              className="grid h-11 w-11 place-items-center rounded-full border border-day-ink/15 bg-white text-day-ink transition hover:border-day-ink/30 disabled:opacity-35"
            >
              <Icon name="chevron-left" size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={edge.end}
              aria-label="Próximo tema"
              className="grid h-11 w-11 place-items-center rounded-full border border-day-ink/15 bg-white text-day-ink transition hover:border-day-ink/30 disabled:opacity-35"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={rowRef}
        onScroll={update}
        className="snap-row mt-12 gap-4 px-4 pb-4 sm:px-8 lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))]"
        style={{ scrollPaddingInline: "max(1rem, calc((100vw - 1320px) / 2 + 2rem))" }}
        aria-label="Temas: do problema à solução"
      >
        {solutions.map((s, i) => {
          const cat = S.byId[s.categoryId];
          return (
            <li key={s.categoryId} className="w-[86vw] max-w-[440px] shrink-0 sm:w-[420px]" aria-roledescription="slide" aria-label={`${i + 1} de ${solutions.length}: ${s.title}`}>
              <article className="card-day flex h-full flex-col rounded-[28px] p-6 sm:p-7">
                <header className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 text-azure">
                    <Icon name={catIcon[s.categoryId]} size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-day-ink">{s.title}</h3>
                    <p className="tabular text-xs text-day-ink-3">
                      {fmtInt(cat.count)} registros · {fmtPct(cat.share)}
                    </p>
                  </div>
                </header>

                <ol className="relative mt-6 flex-1 space-y-5 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-day-ink/10">
                  <Step n="1" title="Problema">
                    <p>{s.problem}</p>
                  </Step>
                  <Step n="2" title="O que identificamos">
                    <ul className="space-y-2">
                      {s.identified.map((x) => (
                        <li key={x.text}>
                          {x.certainty === "hipotese" && (
                            <span className="mb-1 block">
                              <CertaintyBadge kind="hipotese" tone="day" />
                            </span>
                          )}
                          {x.text}
                        </li>
                      ))}
                    </ul>
                  </Step>
                  <Step n="3" title="O que fizemos" tone="done">
                    <ul className="space-y-1.5">
                      {s.did.map((d) => (
                        <li key={d} className="flex gap-2">
                          <Icon name="check" size={16} className="mt-0.5 shrink-0 text-stable-ink" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </Step>
                  <Step n="4" title="Como evitamos a recorrência">
                    <ul className="space-y-2">
                      {s.prevention.map((p) => (
                        <li key={p.text} className="flex flex-col items-start gap-1.5">
                          <StatusBadge status={p.status} />
                          <span>{p.text}</span>
                        </li>
                      ))}
                    </ul>
                  </Step>
                </ol>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="mx-auto mt-20 max-w-[1320px] px-4 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="eyebrow mb-3 text-azure">Resoluções registradas</p>
            <h3 className="headline text-3xl text-day-ink sm:text-4xl">Cada chamado recebeu uma devolutiva.</h3>
            <p className="mt-4 max-w-md leading-relaxed text-day-ink-2">
              {fmtInt(S.resolved)} dos {fmtInt(S.total)} registros estão com status “Resolvido” na base. Os demais: {S.status.emAnalise} em análise,{" "}
              {S.status.orientado} orientado e {S.status.semStatus} sem status registrado.
            </p>
          </Reveal>
          <ul className="grid gap-3 sm:grid-cols-2">
            {resolutions.map((r, i) => (
              <Reveal as="li" key={r.title} delay={i * 0.05} className="card-day rounded-2xl p-5">
                <p className="text-sm font-semibold text-day-ink">{r.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-day-ink-2">{r.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Step({ n, title, children, tone }: { n: string; title: string; children: React.ReactNode; tone?: "done" }) {
  return (
    <li className="relative pl-9">
      <span
        className={`absolute left-0 top-0 grid h-[23px] w-[23px] place-items-center rounded-full font-mono text-[0.65rem] ring-4 ring-white ${
          tone === "done" ? "bg-emerald-100 text-stable-ink" : "bg-day-2 text-day-ink-2"
        }`}
        aria-hidden="true"
      >
        {n}
      </span>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-day-ink-3">{title}</p>
      <div className="mt-1.5 text-[0.92rem] leading-relaxed text-day-ink-2">{children}</div>
    </li>
  );
}
