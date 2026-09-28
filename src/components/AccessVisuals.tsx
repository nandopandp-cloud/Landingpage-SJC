/**
 * Visualizações da história técnica de acesso.
 * Todas animam só transform/opacity, pausam fora de foco (`active=false`)
 * e exibem o estado final estático com prefers-reduced-motion.
 */
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Icon } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

function useStepper(active: boolean, steps: number, ms: number, finalStep: number) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? finalStep : 0);
  useEffect(() => {
    if (reduce) {
      setStep(finalStep);
      return;
    }
    if (!active) {
      setStep(0);
      return;
    }
    const id = setInterval(() => setStep((s) => (s + 1) % steps), ms);
    return () => clearInterval(id);
  }, [active, steps, ms, reduce, finalStep]);
  return step;
}

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="glass relative h-full w-full overflow-hidden rounded-[28px] p-5 sm:p-7" role="img" aria-label={label}>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_70%_20%,rgba(59,130,246,.18),transparent_70%)]" />
      {children}
    </div>
  );
}

/* 01 — Busca levando ao endereço errado */
export function SearchVisual({ active }: { active: boolean }) {
  const step = useStepper(active, 6, 1100, 5);
  const removed = step >= 3;
  const results = [
    { title: "Ambiente de validação", sub: "página de testes · indexada automaticamente", wrong: true },
    { title: "Versão de testes", sub: "página de testes · indexada automaticamente", wrong: true },
    { title: "PLEI · Exploradores", sub: "acesso oficial dos estudantes", wrong: false },
  ];
  return (
    <Frame label="Ilustração: uma busca por Jovens Gênios mostrava páginas de validação; elas foram removidas e resta apenas o acesso oficial.">
      <div className="mx-auto flex h-full max-w-md flex-col justify-center">
        <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3.5">
          <Icon name="search" size={18} className="text-ink-3" />
          <span className="text-ink">Jovens Gênios</span>
          <span className="ml-auto h-4 w-px animate-pulse bg-cyan" />
        </div>
        <ul className="mt-4 space-y-2.5">
          {results.map((r, i) => {
            const gone = r.wrong && removed;
            return (
              <motion.li
                key={r.title}
                initial={false}
                animate={{ opacity: step >= i || removed ? (gone ? 0.35 : 1) : 0, y: step >= i || removed ? 0 : 10 }}
                transition={{ duration: 0.6, ease: EASE }}
                className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 ${
                  r.wrong ? (gone ? "border-white/5 bg-white/[0.02]" : "border-rose-300/25 bg-rose-500/[0.07]") : "border-emerald-300/30 bg-emerald-400/[0.08]"
                }`}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${r.wrong ? "bg-rose-400/15 text-incident" : "bg-emerald-400/15 text-stable"}`}
                >
                  <Icon name={r.wrong ? "alert" : "check"} size={16} />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-medium ${gone ? "text-ink-3 line-through" : "text-ink"}`}>{r.title}</span>
                  <span className="block truncate text-xs text-ink-3">{r.sub}</span>
                </span>
                <AnimatePresence>
                  {gone && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-auto shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[0.68rem] text-ink-2"
                    >
                      removida
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
        <p className="mt-5 text-center text-xs text-ink-3">Solicitações de remoção enviadas ao Google entre 10 e 18/08/2026</p>
      </div>
    </Frame>
  );
}

/* 02 — Migração antecipada de senhas */
export function MigrationVisual({ active }: { active: boolean }) {
  const step = useStepper(active, 5, 1300, 4);
  return (
    <Frame label="Ilustração: a migração das senhas do padrão anterior para o novo estava prevista para o fim do ano letivo, mas uma parcela foi migrada antes; a camada de troca de senha padrão foi ativada.">
      <div className="flex h-full flex-col justify-center gap-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <LockNode title="Padrão anterior" mono="bcrypt" tone="neutral" />
          <div className="relative h-10 w-20 sm:w-32" aria-hidden="true">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-white/10 via-white/30 to-white/10" />
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${step >= 1 ? "bg-incident" : "bg-cyan"}`}
                animate={active ? { left: ["0%", "100%"], opacity: [0, 1, 0] } : { left: "50%", opacity: 0.6 }}
                transition={{ duration: 1.6, delay: d * 0.5, repeat: active ? Infinity : 0, ease: "linear" }}
              />
            ))}
          </div>
          <LockNode title="Novo padrão" mono="scrypt" tone="cyan" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex justify-between text-[0.72rem] text-ink-3">
            <span>Atualização semanal de acessos</span>
            <span>Fim do ano letivo</span>
          </div>
          <div className="relative mt-3 h-2 rounded-full bg-white/[0.07]">
            <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-cyan bg-space-900" title="Migração plena prevista" />
            <motion.div
              className="absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-incident shadow-[0_0_16px_rgba(251,113,133,.8)]"
              initial={false}
              animate={{ scale: step >= 1 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="mt-3 flex justify-between gap-3 text-xs">
            <motion.span className="text-rose-200" initial={false} animate={{ opacity: step >= 1 ? 1 : 0 }}>
              Parcela migrada antes do previsto
            </motion.span>
            <span className="text-cyan">Migração plena prevista</span>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 8 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-400/[0.08] px-4 py-3.5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-stable">
            <Icon name="shield" size={18} />
          </span>
          <span className="text-sm text-ink">
            Camada de troca da senha padrão <span className="font-semibold text-stable">ativada</span>
            <span className="block text-xs text-ink-3">e município notificado sobre o uso da senha padrão</span>
          </span>
        </motion.div>
      </div>
    </Frame>
  );
}

function LockNode({ title, mono, tone }: { title: string; mono: string; tone: "neutral" | "cyan" }) {
  return (
    <div className={`rounded-2xl border p-4 text-center ${tone === "cyan" ? "border-cyan/30 bg-cyan/[0.07]" : "border-white/10 bg-white/[0.03]"}`}>
      <span className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${tone === "cyan" ? "bg-cyan/15 text-cyan" : "bg-white/[0.06] text-ink-2"}`}>
        <Icon name="lock" size={18} />
      </span>
      <p className="mt-2 text-sm font-medium text-ink">{title}</p>
      <p className="font-mono text-[0.7rem] text-ink-3">{mono}</p>
    </div>
  );
}

/* 03 — Sala inteira → mesmo Wi-Fi → mesmo IP → limite → 429 */
export function ClassroomVisual({ active }: { active: boolean }) {
  const STEPS = 12;
  const step = useStepper(active, STEPS, 520, 8);
  const students = 12;
  const passed = Math.min(step, 3);
  const blocked = Math.max(0, Math.min(step, 9) - 3);
  const flow = [
    { icon: "users" as const, label: "Uma sala inteira" },
    { icon: "wifi" as const, label: "Mesmo Wi-Fi" },
    { icon: "server" as const, label: "Mesmo IP público" },
    { icon: "lock" as const, label: "Limite compartilhado" },
  ];
  return (
    <Frame label="Animação: vários estudantes da mesma sala fazem login pelo mesmo Wi-Fi e IP público; os três primeiros logins passam e os seguintes recebem erro 429, exibido como Erro inesperado.">
      <div className="flex h-full flex-col justify-center">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 sm:gap-6">
          {/* estudantes */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2" aria-hidden="true">
            {Array.from({ length: students }).map((_, i) => {
              const state = i < passed ? "ok" : i < passed + blocked ? "blocked" : "idle";
              return (
                <motion.span
                  key={i}
                  initial={false}
                  animate={{ scale: state === "idle" ? 1 : [1, 1.2, 1] }}
                  transition={{ duration: 0.4 }}
                  className={`grid h-7 w-7 place-items-center rounded-lg text-[0.6rem] sm:h-8 sm:w-8 ${
                    state === "ok" ? "bg-emerald-400/20 text-stable" : state === "blocked" ? "bg-rose-500/20 text-incident" : "bg-white/[0.07] text-ink-3"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="4" y="5" width="16" height="11" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M2.5 19h19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </motion.span>
              );
            })}
          </div>

          {/* canal único */}
          <div className="relative h-16" aria-hidden="true">
            <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-gradient-to-r from-white/10 via-white/25 to-white/10" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-space-800 px-2.5 py-1 font-mono text-[0.62rem] text-ink-2 sm:text-[0.68rem]">
              1 IP
            </div>
            {active &&
              [0, 1, 2, 3].map((d) => (
                <motion.span
                  key={d}
                  className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ${step > 3 ? "bg-incident" : "bg-cyan"}`}
                  animate={{ left: ["0%", "96%"], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.1, delay: d * 0.28, repeat: Infinity, ease: "easeIn" }}
                />
              ))}
          </div>

          {/* servidor com contador */}
          <div className="w-28 rounded-2xl border border-white/12 bg-white/[0.04] p-3 text-center sm:w-32">
            <p className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-3">login</p>
            <p className="tabular mt-1 text-2xl font-semibold text-ink">
              {passed}
              <span className="text-ink-3">/3</span>
            </p>
            <p className="text-[0.66rem] text-ink-3">a cada 10 s</p>
            <AnimatePresence>
              {blocked > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 rounded-lg bg-rose-500/15 py-1 font-mono text-sm font-semibold text-incident"
                >
                  429
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <ol className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {flow.map((f, i) => (
            <li key={f.label} className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-ink-2">
              <span className="font-mono text-[0.62rem] text-ink-3">{i + 1}</span>
              <Icon name={f.icon} size={14} className="shrink-0 text-cyan" />
              {f.label}
            </li>
          ))}
        </ol>

        <motion.div
          initial={false}
          animate={{ opacity: blocked > 0 ? 1 : 0.25, y: blocked > 0 ? 0 : 6 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto mt-6 flex w-full max-w-sm items-center gap-3 rounded-2xl border border-rose-300/25 bg-[#1a0f24]/90 px-4 py-3 shadow-[0_12px_40px_-12px_rgba(251,113,133,.45)]"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-500/15 text-incident">
            <Icon name="alert" size={16} />
          </span>
          <span className="text-sm text-ink">
            Erro inesperado. Tente novamente.
            <span className="block text-xs text-ink-3">o que o estudante via na tela</span>
          </span>
        </motion.div>
      </div>
    </Frame>
  );
}

/* 04 — O contador era da sala, não do estudante */
export function LimitVisual({ active }: { active: boolean }) {
  const step = useStepper(active, 10, 450, 9);
  const slots = 9;
  const ok = ["Contraturno", "Acesso residencial", "Internet móvel"];
  return (
    <Frame label="Ilustração: o limite contava logins por IP público e rota; em sala, todos os estudantes dividem o mesmo contador. Em casa, no contraturno ou na internet móvel, isso não acontecia.">
      <div className="flex h-full flex-col justify-center gap-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-ink-3">Mesma rede, contas diferentes, <span className="text-ink">um único contador</span></p>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: slots }).map((_, i) => {
              const on = i < step;
              const over = i >= 3;
              return (
                <motion.span
                  key={i}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0.2, scaleY: on ? 1 : 0.6 }}
                  transition={{ duration: 0.25 }}
                  className={`h-10 flex-1 rounded-md ${over ? "bg-rose-500/40" : "bg-cyan/60"}`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[0.66rem] text-ink-3">
            <span>do 1º ao 3º login ✓</span>
            <span className="text-rose-200">4º em diante → 429</span>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.05] p-4">
          <p className="text-xs text-ink-3">Cenários em que o limite não era um problema</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ok.map((o) => (
              <li key={o} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-100">
                <Icon name="check" size={13} className="text-stable" />
                {o}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Frame>
  );
}

/* 05 — Proteção evoluída */
export function ShieldVisual({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const step = useStepper(active, 6, 700, 5);
  return (
    <Frame label="Ilustração: o limite de requisições foi ampliado e a proteção contra DDoS foi reforçada no servidor.">
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <div className="relative grid h-32 w-32 place-items-center" aria-hidden="true">
          {!reduce && active && <span className="pulse-ring absolute inset-0 rounded-full border border-emerald-300/40" />}
          <span className="absolute inset-3 rounded-full bg-[radial-gradient(circle,rgba(74,222,128,.25),transparent_70%)]" />
          <span className="relative grid h-20 w-20 place-items-center rounded-full border border-emerald-300/30 bg-emerald-400/10 text-stable">
            <Icon name="shield" size={36} />
          </span>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex justify-between text-xs">
              <span className="text-ink-2">Limite na mesma janela de tempo</span>
              <span className="font-medium text-stable">ampliado</span>
            </div>
            <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="absolute inset-y-0 left-0 w-[22%] rounded-full bg-white/25" />
              <motion.div
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-cyan to-stable"
                initial={false}
                animate={{ scaleX: step >= 1 ? 1 : 0.22 }}
                transition={{ duration: 1.2, ease: EASE }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-ink-2">
            <Icon name="server" size={16} className="shrink-0 text-cyan" />
            Proteção contra possíveis ataques DDoS reforçada no próprio servidor
          </div>
          <div className="grid grid-cols-12 gap-1" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.span
                key={i}
                initial={false}
                animate={{ opacity: step >= 2 ? 1 : 0.2 }}
                transition={{ duration: 0.3, delay: step >= 2 ? i * 0.05 : 0 }}
                className="h-6 rounded bg-emerald-400/30"
              />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}
