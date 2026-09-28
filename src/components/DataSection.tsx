import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { categoryInfo, groupInfo } from "../data/content";
import { fmtDate, fmtInt, fmtPct, incidentStats as S, type CategoryId, type WeekPoint } from "../data/incidents";
import { CountUp, Icon, Reveal, SectionHeader, useSpotlight } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

export function DataSection() {
  const spot = useSpotlight();
  const fw = S.focusWeek;
  const ratio = fw.ratio ? Math.round(fw.ratio) : null;

  const kpis = [
    {
      value: <CountUp to={S.total} />,
      label: "registros de ocorrência",
      sub: `de ${fmtDate(S.period.start)} a ${fmtDate(S.period.end, { day: "2-digit", month: "2-digit", year: "numeric" })}`,
      icon: "clipboard" as const,
      accent: "text-sky",
    },
    {
      value: <CountUp to={S.resolutionRate} decimals={2} suffix="%" />,
      label: "com status “Resolvido”",
      sub: `${fmtInt(S.resolved)} de ${fmtInt(S.total)} registros`,
      icon: "check" as const,
      accent: "text-stable",
    },
    {
      value: <CountUp to={S.topTwo.share} decimals={2} suffix="%" />,
      label: "em dois temas",
      sub: "acesso/credenciais + cadastro/vínculo de alunos",
      icon: "users" as const,
      accent: "text-violet",
    },
    {
      value: <CountUp to={fw.count} />,
      label: `registros entre ${fmtDate(fw.weekStart)} e ${fmtDate(fw.end)}`,
      sub: ratio ? `${ratio}× a semana anterior (${fw.previousWeekCount})` : `semana anterior: ${fw.previousWeekCount}`,
      icon: "alert" as const,
      accent: "text-incident",
    },
  ];

  return (
    <section id="dados" aria-labelledby="dados-title" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionHeader
            id="dados-title"
            eyebrow="Transparência"
            title={
              <>
                Transparência <span className="text-glow">começa pelos dados.</span>
              </>
            }
            lede={`Síntese de todos os relatos registrados no formulário de ocorrências entre ${fmtDate(S.period.start)} e ${fmtDate(
              S.period.end,
              { day: "2-digit", month: "2-digit", year: "numeric" },
            )}, enviados por ${S.schoolsCount} unidades escolares.`}
          />
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <Reveal as="li" key={i} delay={i * 0.08}>
              <div onPointerMove={spot} className="glass spotlight h-full rounded-3xl p-6">
                <div className={`mb-6 grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] ${k.accent}`}>
                  <Icon name={k.icon} size={19} />
                </div>
                <p className="text-[2.6rem] font-semibold leading-none tracking-[-0.04em] text-ink sm:text-5xl">{k.value}</p>
                <p className="mt-3 text-[0.95rem] font-medium text-ink">{k.label}</p>
                <p className="mt-1 text-sm text-ink-3">{k.sub}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-4">
          <WeeklyRhythm />
        </Reveal>

        <Distribution />
      </div>
    </section>
  );
}

/* ———————————————— Ritmo semanal ———————————————— */

function topCategories(byCategory: Record<CategoryId, number>, n = 3) {
  return (Object.entries(byCategory) as [CategoryId, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function WeeklyRhythm() {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const weeks = S.weekly;
  const max = Math.max(...weeks.map((w) => w.count));
  const W = 1000;
  const H = 200;
  const padT = 28;
  const gap = 6;
  const bw = (W - gap * (weeks.length - 1)) / weeks.length;
  const focusIdx = weeks.findIndex((w) => w.weekStart === S.focusWeek.weekStart);
  const peakIdx = weeks.findIndex((w) => w.weekStart === S.peakWeek.weekStart);
  const peakTop = topCategories(S.peakWeek.byCategory).map(([id]) => S.byId[id].label.toLowerCase());

  const months = useMemo(() => {
    const seen = new Set<string>();
    return weeks
      .map((w, i) => {
        const d = new Date(`${w.weekStart}T12:00:00`);
        const key = `${d.getMonth()}`;
        if (seen.has(key)) return null;
        seen.add(key);
        return { i, label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") };
      })
      .filter(Boolean) as { i: number; label: string }[];
  }, [weeks]);

  const barPath = (x: number, y: number, w: number, h: number) => {
    const r = Math.min(4, h, w / 2);
    return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
  };

  const hw: WeekPoint | null = hover !== null ? weeks[hover] : null;

  return (
    <figure className="glass rounded-3xl p-5 sm:p-7">
      <figcaption className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base font-semibold text-ink">Registros por semana</p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-2">
            Na semana de {fmtDate(S.focusWeek.weekStart)} a {fmtDate(S.focusWeek.end)}, durante as Olimpíadas, foram{" "}
            {S.focusWeek.count} registros, {S.focusWeek.ratio ? `${Math.round(S.focusWeek.ratio)}× o volume da` : "acima da"} semana anterior. O maior
            volume da série foi na semana de {fmtDate(S.peakWeek.weekStart)} ({S.peakWeek.count}), concentrado em {peakTop.join(", ")}.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-xs text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#8ea2d8]/60" /> Semana
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan" /> {fmtDate(S.focusWeek.weekStart)} a {fmtDate(S.focusWeek.end)}
          </span>
        </div>
      </figcaption>

      <div className="relative mt-6" onPointerLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 ${W} ${H + 26}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`Gráfico de barras com ${weeks.length} semanas. Pico de ${S.peakWeek.count} registros na semana de ${fmtDate(
            S.peakWeek.weekStart,
          )}; ${S.focusWeek.count} registros na semana de ${fmtDate(S.focusWeek.weekStart)}.`}
        >
          {[0.5, 1].map((t) => (
            <line key={t} x1="0" x2={W} y1={padT + (H - padT) * (1 - t)} y2={padT + (H - padT) * (1 - t)} stroke="rgba(255,255,255,.06)" />
          ))}
          <line x1="0" x2={W} y1={H} y2={H} stroke="rgba(255,255,255,.14)" />
          {weeks.map((w, i) => {
            const h = w.count === 0 ? 1.5 : ((H - padT) * w.count) / max;
            const x = i * (bw + gap);
            const y = H - h;
            const isFocus = i === focusIdx;
            const dim = hover !== null && hover !== i;
            return (
              <g key={w.weekStart}>
                <motion.path
                  d={barPath(x, y, bw, h)}
                  fill={isFocus ? "#67e8f9" : "#8ea2d8"}
                  fillOpacity={isFocus ? 1 : dim ? 0.3 : 0.6}
                  initial={reduce ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.025, ease: EASE }}
                  style={{ transformOrigin: `${x + bw / 2}px ${H}px`, transformBox: "view-box" }}
                />
                {(i === peakIdx || isFocus) && (
                  <text x={x + bw / 2} y={y - 8} textAnchor="middle" className="tabular" fill={isFocus ? "#a5f3fc" : "#b9c2de"} fontSize="13" fontWeight="600">
                    {w.count}
                  </text>
                )}
                {/* alvo de hover maior que a barra */}
                <rect x={x - gap / 2} y={0} width={bw + gap} height={H} fill="transparent" onPointerEnter={() => setHover(i)} />
              </g>
            );
          })}
          {months.map((m) => (
            <text key={m.i} x={m.i * (bw + gap)} y={H + 20} fill="#8a94b6" fontSize="12" className="capitalize">
              {m.label}
            </text>
          ))}
        </svg>

        <AnimatePresence>
          {hw && hover !== null && (
            <motion.div
              key="tip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="glass-strong pointer-events-none absolute top-0 z-10 w-56 rounded-2xl p-3.5 text-sm"
              style={{
                left: `clamp(0px, calc(${((hover + 0.5) / weeks.length) * 100}% - 112px), calc(100% - 224px))`,
              }}
            >
              <p className="text-xs text-ink-3">Semana de {fmtDate(hw.weekStart)}</p>
              <p className="mt-0.5 text-lg font-semibold text-ink">
                {hw.count} {hw.count === 1 ? "registro" : "registros"}
              </p>
              {topCategories(hw.byCategory, 2).map(([id, v]) => (
                <p key={id} className="mt-1 flex justify-between gap-3 text-xs text-ink-2">
                  <span className="truncate">{categoryInfo[id].short}</span>
                  <span className="tabular text-ink">{v}</span>
                </p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <details className="mt-4 text-sm text-ink-2">
        <summary className="cursor-pointer select-none text-ink-3 hover:text-ink">Ver dados em tabela</summary>
        <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-space-800 text-ink-3">
              <tr>
                <th className="px-3 py-2 font-medium">Semana (início)</th>
                <th className="px-3 py-2 text-right font-medium">Registros</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.weekStart} className="border-t border-white/5">
                  <td className="px-3 py-1.5">{fmtDate(w.weekStart, { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                  <td className="tabular px-3 py-1.5 text-right">{w.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

/* ———————————————— Distribuição agrupada ———————————————— */

type GroupId = "processo" | "plataforma" | "sem_detalhe";

const GROUP_STYLE: Record<GroupId, { bar: string; soft: string; dot: string; text: string }> = {
  processo: {
    bar: "linear-gradient(90deg,#14b8a6,#5eead4)",
    soft: "rgba(45,212,191,.55)",
    dot: "#2dd4bf",
    text: "text-[#5eead4]",
  },
  plataforma: {
    bar: "linear-gradient(90deg,#3b82f6,#818cf8)",
    soft: "rgba(129,140,248,.55)",
    dot: "#818cf8",
    text: "text-[#a5b4fc]",
  },
  sem_detalhe: {
    bar: "repeating-linear-gradient(45deg, rgba(142,162,216,.75) 0 3px, rgba(142,162,216,.25) 3px 7px)",
    soft: "rgba(142,162,216,.45)",
    dot: "#8ea2d8",
    text: "text-ink-3",
  },
};

function Distribution() {
  const reduce = useReducedMotion();
  const groups = S.groups;
  const [active, setActive] = useState<CategoryId>(S.categories[0].id);
  const max = Math.max(...S.categories.map((c) => c.count));
  const a = S.byId[active];
  const activeGroup = a.group as GroupId;
  let row = 0;

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <Reveal className="glass rounded-3xl p-5 sm:p-7">
        <div className="mb-6 flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-cyan">
            <Icon name="layers" size={19} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Distribuição dos problemas</h3>
            <p className="text-sm text-ink-3">Tema dominante de cada registro, agrupado pela natureza do problema · passe o mouse ou toque para detalhes</p>
          </div>
        </div>

        <div className="space-y-6">
          {groups.map((g) => {
            const gid = g.id as GroupId;
            const st = GROUP_STYLE[gid];
            const cats = g.categories.map((id) => S.byId[id]).sort((x, y) => y.count - x.count);
            return (
              <section key={g.id} aria-labelledby={`grupo-${g.id}`}>
                <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-white/[0.07] px-3 pb-2">
                  <h4 id={`grupo-${g.id}`} className={`flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.12em] ${st.text}`}>
                    <span className="h-2 w-2 rounded-full" style={{ background: st.dot }} aria-hidden="true" />
                    {groupInfo[g.id].title}
                  </h4>
                  <p className="tabular shrink-0 text-sm text-ink-2">
                    <span className="font-semibold text-ink">{g.count}</span> · {fmtPct(g.share)}
                  </p>
                </div>
                <ul className="space-y-1">
                  {cats.map((c) => {
                    const isActive = c.id === active;
                    const i = row++;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onPointerEnter={() => setActive(c.id)}
                          onFocus={() => setActive(c.id)}
                          onClick={() => setActive(c.id)}
                          aria-pressed={isActive}
                          className={`grid w-full grid-cols-[minmax(0,1fr)_2.6rem_4.2rem] items-center gap-x-3 gap-y-2 rounded-xl px-3 py-2.5 text-left transition sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_2.6rem_4.2rem] ${
                            isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                          }`}
                        >
                          <span className={`text-[0.9rem] leading-snug ${isActive ? "text-ink" : "text-ink-2"}`}>{c.label}</span>
                          <span className="col-span-3 row-start-2 h-2.5 overflow-hidden rounded-full bg-white/[0.06] sm:col-span-1 sm:row-start-auto">
                            <motion.span
                              className="block h-full origin-left rounded-full"
                              style={{ width: `${(c.count / max) * 100}%`, background: st.bar, opacity: isActive ? 1 : 0.8 }}
                              initial={reduce ? false : { scaleX: 0 }}
                              whileInView={{ scaleX: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.1, delay: 0.1 + i * 0.06, ease: EASE }}
                            />
                          </span>
                          <span className="tabular text-right text-[0.9rem] font-semibold text-ink">{c.count}</span>
                          <span className="tabular text-right text-[0.85rem] text-ink-3">{fmtPct(c.share)}</span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden px-3 text-sm leading-relaxed text-ink-3 lg:hidden"
                            >
                              <span className="block pb-2">{categoryInfo[c.id].description}</span>
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </Reveal>

      {/* ——— resumo: processo × plataforma ——— */}
      <Reveal delay={0.1} className="glass flex flex-col rounded-3xl p-6 sm:p-7">
        <p className="text-sm text-ink-3">Natureza dos registros</p>
        <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-white/[0.06]" role="img" aria-label={groups.map((g) => `${groupInfo[g.id].title}: ${fmtPct(g.share)}`).join("; ")}>
          {groups.map((g, i) => (
            <motion.span
              key={g.id}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${g.share}%`, background: GROUP_STYLE[g.id as GroupId].bar, marginLeft: i ? 2 : 0 }}
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.2 + i * 0.2, ease: EASE }}
            />
          ))}
        </div>
        <ul className="mt-6 space-y-5">
          {groups.map((g) => {
            const st = GROUP_STYLE[g.id as GroupId];
            const on = activeGroup === g.id;
            return (
              <li key={g.id} className={`rounded-2xl border p-4 transition ${on ? "border-white/15 bg-white/[0.04]" : "border-transparent"}`}>
                <p className="flex items-baseline justify-between gap-3">
                  <span className={`flex items-center gap-2 text-sm font-semibold ${st.text}`}>
                    <span className="h-2 w-2 rounded-full" style={{ background: st.dot }} aria-hidden="true" />
                    {groupInfo[g.id].title}
                  </span>
                  <span className="tabular text-2xl font-semibold tracking-[-0.02em] text-ink">{fmtPct(g.share)}</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{groupInfo[g.id].description}</p>
                <p className="tabular mt-1 text-xs text-ink-3">{g.count} registros</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto hidden border-t border-white/[0.07] pt-5 lg:block" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-3">Em destaque</p>
              <p className="mt-1 font-semibold text-ink">{a.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{categoryInfo[a.id].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </div>
  );
}
