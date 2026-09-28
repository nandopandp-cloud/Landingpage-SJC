import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { commitment } from "../data/content";
import { fmtDate, fmtInt, incidentStats as S } from "../data/incidents";
import { PleiLogo } from "./art";
import { Icon, Reveal } from "./ui";

export function Commitment() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // a "câmera" se aproxima devagar enquanto a seção entra na tela
  const zoom = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.12, 1]);
  const dawn = useTransform(scrollYProgress, [0.3, 1], [0, 1]);

  return (
    <section
      ref={ref}
      id="compromisso"
      aria-labelledby="compromisso-title"
      className="grain relative isolate z-40 -mt-10 overflow-hidden rounded-t-[40px] bg-space-950 sm:rounded-t-[56px]"
    >
      {/* cena: o explorador na rocha olhando a cidade ao amanhecer (frame 1 do hero) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.img
          src="/hero/closing.webp"
          alt=""
          width={1432}
          height={941}
          loading="lazy"
          decoding="async"
          style={{ scale: zoom }}
          className="absolute inset-0 h-full w-full origin-[62%_60%] object-cover object-[54%_50%]"
        />
        {/* luz nascendo no horizonte */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: dawn,
            background: "radial-gradient(40% 45% at 85% 24%, rgba(255,214,150,.35), transparent 70%), radial-gradient(60% 40% at 80% 70%, rgba(253,186,116,.16), transparent 70%)",
            mixBlendMode: "screen",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,5,15,.82)_0%,rgba(3,5,15,.55)_34%,transparent_62%)] max-lg:bg-[linear-gradient(180deg,rgba(3,5,15,.92)_0%,rgba(3,5,15,.7)_45%,transparent_72%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-space-950 to-transparent" />
      </div>
      <div className="relative mx-auto grid min-h-[100svh] max-w-[1320px] items-start px-4 pb-[70vw] pt-28 sm:px-8 sm:pb-[40vw] lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <Reveal>
            <p className="eyebrow mb-5 text-amber-200/90">{commitment.eyebrow}</p>
            <h2 id="compromisso-title" className="display text-[2.8rem] sm:text-6xl lg:text-[4.2rem]">
              <span className="block text-ink">{commitment.title[0]}</span>{" "}
              <span className="text-glow block">{commitment.title[1]}</span>
            </h2>
          </Reveal>
          <div className="mt-8 max-w-xl space-y-4">
            {commitment.body.map((b, i) => (
              <Reveal key={i} delay={0.1 + i * 0.1}>
                <p className="lede text-lg leading-relaxed text-ink-2">{b}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <ul className="mt-10 grid gap-3 sm:grid-cols-3">
              {commitment.pillars.map((p, i) => (
                <li key={p} className="glass flex items-center gap-3 rounded-2xl px-4 py-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.07] text-cyan">
                    <Icon name={(["shield", "book", "spark"] as const)[i]} size={17} />
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-[0.06em] text-ink">{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-ink-3">{commitment.signature}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Methodology() {
  const rows = [
    ["Resolvido", S.status.resolvido],
    ["Em análise", S.status.emAnalise],
    ["Orientado", S.status.orientado],
    ["Sem status registrado", S.status.semStatus],
  ] as const;
  return (
    <section id="metodologia" aria-labelledby="metodologia-title" className="relative z-40 border-t border-white/[0.07] bg-space-950 py-20">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 sm:px-8 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="eyebrow mb-3 text-ink-3">Metodologia</p>
          <h2 id="metodologia-title" className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            Como os dados foram analisados
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-3">
            Números calculados diretamente da base bruta do formulário de ocorrências, reprocessada para esta página. Apenas dados agregados são exibidos.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <ul className="space-y-4 text-sm leading-relaxed text-ink-2">
            <li>
              <strong className="font-medium text-ink">Base.</strong> {fmtInt(S.total)} registros preenchidos no formulário entre{" "}
              {fmtDate(S.period.start, { day: "2-digit", month: "2-digit", year: "numeric" })} e{" "}
              {fmtDate(S.period.end, { day: "2-digit", month: "2-digit", year: "numeric" })}. Cada linha preenchida conta como um registro.
            </li>
            <li>
              <strong className="font-medium text-ink">Registros, não pessoas.</strong> Os percentuais representam submissões ao formulário, não
              necessariamente pessoas afetadas: um mesmo caso pode gerar mais de um registro, e um registro múltiplo pode reunir vários casos.
            </li>
            <li>
              <strong className="font-medium text-ink">Categorias.</strong> Cada registro foi classificado pelo tema dominante do relato; a devolutiva
              da equipe foi usada apenas como desempate. Os {S.recordTypes.multipla} registros enviados como “múltipla professor e/ou aluno” tinham o
              detalhe em anexo e foram classificados pela devolutiva da equipe; {S.byId.multiplos_sem_detalhe.count} deles não permitem identificar o
              tema.
            </li>
            <li>
              <strong className="font-medium text-ink">Natureza.</strong> Cadastro e vínculo de alunos, avaliações e os pedidos em lote de reset
              de senha e ajustes foram agrupados como processo e comunicação: não eram falhas da plataforma, e sim situações em que faltou clareza
              entre as partes.
            </li>
            <li>
              <strong className="font-medium text-ink">Integralidade.</strong> A contagem inclui registros sem status e {S.dataQuality.testLikeRecords}{" "}
              registros que aparentam ser testes do próprio formulário, para preservar a correspondência com a base.
            </li>
          </ul>
          <div>
            <table className="w-full text-sm">
              <caption className="mb-3 text-left text-xs uppercase tracking-[0.14em] text-ink-3">Status registrado na base</caption>
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k} className="border-t border-white/[0.07]">
                    <th scope="row" className="py-2.5 text-left font-normal text-ink-2">
                      {k}
                    </th>
                    <td className="tabular py-2.5 text-right font-medium text-ink">{v}</td>
                  </tr>
                ))}
                <tr className="border-t border-white/20">
                  <th scope="row" className="py-2.5 text-left font-medium text-ink">
                    Total
                  </th>
                  <td className="tabular py-2.5 text-right font-semibold text-ink">{S.total}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-5 flex gap-2 rounded-2xl bg-white/[0.03] p-4 text-xs leading-relaxed text-ink-3">
              <Icon name="lock" size={15} className="mt-0.5 shrink-0" />
              Privacidade: nenhum nome, e-mail, data de nascimento, turma, escola individual ou endereço interno é exibido. A página não contém os dados
              brutos da planilha.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative z-40 border-t border-white/[0.07] bg-space-950 py-10">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-5">
          <PleiLogo />
          <span className="hidden h-8 w-px bg-white/10 sm:block" />
          <p className="text-sm text-ink-3">Uma experiência Jovens Gênios.</p>
        </div>
        <div className="flex flex-col gap-1 text-xs text-ink-3 sm:items-end">
          <p>Relatório de ocorrências · 2026</p>
          <p>
            Dados agregados entre {fmtDate(S.period.start)} e {fmtDate(S.period.end, { day: "2-digit", month: "2-digit", year: "numeric" })} ·{" "}
            <a href="#metodologia" className="underline decoration-white/20 underline-offset-4 hover:text-ink">
              metodologia
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
