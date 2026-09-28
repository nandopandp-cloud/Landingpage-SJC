import { alreadyDone, improvements, learnings, statusLabel, type ImprovementStatus } from "../data/content";
import { Icon, Reveal, SectionHeader, StatusBadge } from "./ui";

const tint: Record<string, string> = {
  radar: "from-fuchsia-100 to-violet-100 text-violet-600",
  server: "from-emerald-100 to-teal-100 text-emerald-700",
  deploy: "from-amber-100 to-orange-100 text-orange-600",
  contingency: "from-sky-100 to-blue-100 text-blue-700",
  support: "from-pink-100 to-rose-100 text-rose-600",
};

export function Improvements() {
  return (
    <section
      id="mudancas"
      aria-labelledby="mudancas-title"
      className="on-day relative z-30 -mt-10 rounded-t-[40px] bg-day pb-20 pt-20 text-day-ink sm:rounded-t-[56px] sm:pt-28"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
        <SectionHeader
          id="mudancas-title"
          tone="day"
          eyebrow="O que mudou"
          title={
            <>
              Não queríamos apenas resolver os chamados.{" "}
              <span className="text-glow-day">Queríamos reduzir a chance de eles acontecerem novamente.</span>
            </>
          }
        />

        <Reveal className="mt-12">
          <div className="rounded-[28px] border border-emerald-600/15 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg font-semibold text-day-ink">Já implementado</p>
              <StatusBadge status="implementado" />
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {alreadyDone.map((d) => (
                <li key={d} className="flex gap-2.5 text-[0.92rem] leading-snug text-day-ink-2">
                  <Icon name="check" size={18} className="mt-0.5 shrink-0 text-stable-ink" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="text-xl font-semibold text-day-ink">Cinco frentes estruturais</h3>
          <Legend />
        </div>
        <ul className="snap-row -mx-4 mt-5 gap-3 px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {improvements.map((m, i) => (
            <Reveal as="li" key={m.n} delay={i * 0.07} className="w-[78vw] max-w-[320px] shrink-0 sm:w-auto sm:max-w-none">
              <article className="card-day group flex h-full flex-col rounded-[24px] p-6 transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(30,41,99,.4)]">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tint[m.icon]}`}>
                  <Icon name={m.icon} size={22} />
                </span>
                <p className="mt-5 font-mono text-xs text-day-ink-3">{m.n}</p>
                <h4 className="mt-1 text-[1.05rem] font-semibold leading-snug text-day-ink">{m.title}</h4>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-day-ink-2">{m.text}</p>
                <div className="mt-5">
                  <StatusBadge status={m.status} />
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Legend() {
  const items: ImprovementStatus[] = ["implementado", "em_andamento"];
  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-day-ink-3">
      <span className="sr-only">Legenda de status:</span>
      {items.map((s) => (
        <span key={s} className="inline-flex items-center" title={statusLabel[s]}>
          <StatusBadge status={s} />
        </span>
      ))}
    </p>
  );
}

export function Learnings() {
  const icons = ["users", "radar", "eye", "layers"] as const;
  return (
    <section id="aprendizados" aria-labelledby="aprendizados-title" className="on-day relative z-30 bg-day pb-28 pt-10 text-day-ink sm:pb-36">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
        <div className="rounded-[32px] bg-gradient-to-br from-white to-day-2 p-6 ring-1 ring-day-ink/5 sm:p-10">
          <SectionHeader
            id="aprendizados-title"
            tone="day"
            eyebrow="O que aprendemos"
            title={
              <>
                Cada incidente <span className="text-glow-day">trouxe um aprendizado.</span>
              </>
            }
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {learnings.map((l, i) => (
              <Reveal as="li" key={l.title} delay={i * 0.08} className="card-day rounded-[22px] p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon name={icons[i]} size={19} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-day-ink">{l.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-day-ink-2">{l.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
