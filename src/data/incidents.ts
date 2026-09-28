/**
 * Dados agregados das ocorrências — ÚNICA fonte numérica da página.
 *
 * Origem: incidents.generated.json, gerado por scripts/aggregate_incidents.py a partir da
 * planilha bruta "Ocorrências PLEI 2026 (respostas).xlsx". A planilha não entra no repositório
 * e nenhum dado pessoal chega ao bundle (o script varre o resultado atrás de nomes/e-mails).
 *
 * ⚠ RECONCILIAÇÃO (detalhes em docs/RECONCILIACAO.md)
 * A análise consolidada anterior (analise-ocorrencias-plei.html) informa 405 ocorrências,
 * 391 resolvidas (96,54%) e 11 sem status. A base bruta tem 404 linhas preenchidas
 * (linhas 2–405 da planilha) e 10 sem status. A diferença de 1 registro está inteira em
 * "sem status" e sua origem não pôde ser confirmada (a análise cita uma *cópia* da planilha).
 * Por isso a página publica os números da base bruta: 404 registros, 391 resolvidos (96,78%).
 * As categorias foram reclassificadas de forma reproduzível (regras + overrides documentados
 * por linha em docs/auditoria/classificacao-por-linha.csv) e somam 404.
 */
import generated from "./incidents.generated.json";

export type CategoryId =
  | "cadastro_alunos"
  | "acesso_credenciais"
  | "avaliacoes"
  | "profissionais"
  | "atividades"
  | "outros"
  | "funcionalidade"
  | "multiplos_processo"
  | "multiplos_plataforma";

/** processo = ruído de processo/comunicação (não eram falhas da plataforma); plataforma = acesso e uso. */
export type GroupId = "processo" | "plataforma";

export interface Category {
  id: CategoryId;
  label: string;
  count: number;
  share: number;
  group: GroupId;
}

export interface Group {
  id: GroupId;
  label: string;
  categories: CategoryId[];
  count: number;
  share: number;
}

export interface WeekPoint {
  weekStart: string;
  count: number;
  byCategory: Record<CategoryId, number>;
}

interface Generated {
  period: { start: string; end: string };
  total: number;
  status: { resolvido: number; emAnalise: number; orientado: number; semStatus: number };
  resolutionRate: number;
  recordTypes: { aluno: number; profissional: number; multipla: number };
  schoolsCount: number;
  categories: Category[];
  groups: Group[];
  weekly: WeekPoint[];
  focusWeek: {
    weekStart: string;
    end: string;
    count: number;
    previousWeekCount: number;
    byCategory: Record<CategoryId, number>;
  };
  peakWeek: { weekStart: string; count: number; byCategory: Record<CategoryId, number> };
  signals: {
    unexpectedErrorMentions: number;
    unexpectedErrorFirstSeen: string | null;
    intermittentLoginMentions: number;
    intermittentLoginFirstSeen: string | null;
  };
  dataQuality: { testLikeRecords: number; multiplosSemDetalhe: number; note: string };
}

const g = generated as unknown as Generated;

const byId = Object.fromEntries(g.categories.map((c) => [c.id, c])) as Record<CategoryId, Category>;

/** Os dois temas que concentram a maior parte dos relatos (derivado, não fixo). */
const [first, second] = [...g.categories].filter((c) => !c.id.startsWith("multiplos")).sort((a, b) => b.count - a.count);
const topTwoCount = first.count + second.count;

export const incidentStats = {
  period: g.period,
  total: g.total,
  status: g.status,
  resolved: g.status.resolvido,
  resolutionRate: g.resolutionRate,
  recordTypes: g.recordTypes,
  schoolsCount: g.schoolsCount,
  categories: g.categories,
  groups: g.groups,
  byId,
  topTwo: {
    ids: [first.id, second.id] as [CategoryId, CategoryId],
    count: topTwoCount,
    share: Math.round((10000 * topTwoCount) / g.total) / 100,
  },
  weekly: g.weekly,
  focusWeek: {
    ...g.focusWeek,
    ratio: g.focusWeek.previousWeekCount ? g.focusWeek.count / g.focusWeek.previousWeekCount : null,
  },
  peakWeek: g.peakWeek,
  signals: g.signals,
  dataQuality: g.dataQuality,
} as const;

/**
 * Valores da análise consolidada anterior — mantidos SOMENTE para auditoria/comparação.
 * Não são exibidos na página.
 */
export const previousAnalysisReference = {
  source: "analise-ocorrencias-plei.html (fonte citada: 'Cópia de Ocorrências PLEI 2026 (respostas)')",
  total: 405,
  resolved: 391,
  resolutionRate: 96.54,
  status: { resolvido: 391, emAnalise: 2, orientado: 1, semStatus: 11 },
  categories: {
    cadastro_alunos: 112,
    acesso_credenciais: 97,
    /** o HTML não dividia os múltiplos: 64 numa categoria só */
    multiplos: 64,
    avaliacoes: 51,
    profissionais: 28,
    atividades: 24,
    outros: 21,
    funcionalidade: 8,
  },
} as const;

// ——— Formatação pt-BR ———
const nf = new Intl.NumberFormat("pt-BR");
const pf = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtInt = (n: number) => nf.format(n);
export const fmtPct = (n: number) => `${pf.format(n)}%`;
export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" }) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", opts);
