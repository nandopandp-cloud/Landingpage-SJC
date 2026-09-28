/**
 * Conteúdo editorial da página, separado do JSX.
 *
 * Cada afirmação factual indica sua origem em `source`:
 *   docx  → "Problemas de acesso - SJC.docx" (detalhamento técnico)
 *   html  → "analise-ocorrencias-plei.html" (análise consolidada)
 *   xlsx  → base bruta (via incidents.generated.json)
 *   brief → requisito editorial explícito do briefing (não é fato comprovado)
 *
 * `certainty` distingue fato, hipótese e ação — a página exibe hipóteses com selo próprio.
 * Status das cinco frentes estruturais: definidos pelo time (setembro/2026). Quatro implementadas,
 * comunicação e suporte em andamento. Ver docs/RECONCILIACAO.md §6.
 */

export type Source = "docx" | "html" | "xlsx" | "brief";
export type Certainty = "fato" | "hipotese" | "acao" | "plano";
export type ImprovementStatus = "implementado" | "em_andamento" | "planejado";

export const nav = [
  { id: "aconteceu", label: "O que aconteceu" },
  { id: "acesso", label: "Como resolvemos" },
  { id: "aprendizados", label: "O que aprendemos" },
  { id: "mudancas", label: "O que mudou" },
  { id: "compromisso", label: "Compromisso" },
] as const;

/* ————————————————————————— HERO ————————————————————————— */

export type HeroTone = "journey" | "challenge" | "action" | "stable" | "evolve";

/** Brilho animado sobre um elemento da arte (coordenadas da imagem 1672×941). */
export interface HeroGlow {
  x: number;
  y: number;
  w: number;
  h: number;
  /** rgb "r,g,b" */
  color: string;
  kind?: "card" | "sun" | "beam";
}

export interface HeroBeat {
  /** capítulo exibido nos indicadores (01–05) */
  chapter: number;
  tone: HeroTone;
  /** duração em ms */
  duration: number;
  eyebrow: string;
  /** primeira linha em branco; as demais com o gradiente do tom da cena */
  lines: string[];
  /** linha de apoio maior (frames 1 e 5) */
  sub?: string[];
  body?: string;
  /** plate sem extensão, gerada por scripts/make_hero_plates.py */
  plate: string;
  /** descrição da arte para leitores de tela */
  alt: string;
  /** foco horizontal do personagem (0–1) no layout empilhado (mobile/tablet) */
  focusX: number;
  /** tipografia medida no frame (px na imagem 1672×941): topo do eyebrow, corpo do título, largura do parágrafo */
  layout: { top: number; title: number; bodyWidth?: number };
  glows: HeroGlow[];
}

export const heroChapters = [
  { n: 1, label: "Jornada" },
  { n: 2, label: "Desafios" },
  { n: 3, label: "Ações" },
  { n: 4, label: "Estabilidade" },
  { n: 5, label: "Evolução" },
] as const;

const ROSE = "251,113,133";
const CYAN = "56,189,248";
const TEAL = "45,212,191";
const SUN = "255,214,150";

/**
 * Storyboard do hero: um frame de referência por capítulo (design/hero-frames).
 * Os textos seguem os frames aprovados.
 */
export const heroBeats: HeroBeat[] = [
  {
    chapter: 1,
    tone: "journey",
    duration: 5000,
    eyebrow: "PLEI · Exploradores",
    lines: ["Uma jornada", "de conhecimento."],
    sub: ["E uma semana que nos fez evoluir."],
    plate: "/hero/frame-01",
    layout: { top: 240, title: 80 },
    alt: "Um jovem explorador, de mochila com o símbolo da PLEI, observa de uma rocha um grande planeta e uma cidade futurista ao amanhecer.",
    focusX: 0.5,
    glows: [
      { x: 1215, y: 212, w: 300, h: 300, color: SUN, kind: "sun" },
      { x: 1262, y: 600, w: 520, h: 150, color: SUN },
    ],
  },
  {
    chapter: 2,
    tone: "challenge",
    duration: 5600,
    eyebrow: "Os desafios",
    lines: ["Alguns exploradores", "encontraram obstáculos."],
    body: "Durante a semana, recebemos um volume acima do esperado de chamados, com impacto principalmente em acessos, credenciais e outros fluxos da plataforma.",
    plate: "/hero/frame-02",
    layout: { top: 210, title: 62, bodyWidth: 420 },
    alt: "O explorador, preocupado, diante de avisos flutuantes: não consigo acessar, a prova travou, fui desconectado da plataforma, minha turma não aparece.",
    focusX: 0.52,
    glows: [
      { x: 798, y: 234, w: 300, h: 190, color: ROSE, kind: "card" },
      { x: 1255, y: 245, w: 280, h: 190, color: ROSE, kind: "card" },
      { x: 1043, y: 402, w: 310, h: 160, color: ROSE, kind: "card" },
      { x: 1284, y: 522, w: 320, h: 170, color: ROSE, kind: "card" },
      { x: 1117, y: 727, w: 240, h: 150, color: ROSE, kind: "card" },
    ],
  },
  {
    chapter: 3,
    tone: "action",
    duration: 6000,
    eyebrow: "A equipe age",
    lines: ["Quando identificamos", "os problemas,", "entramos em ação."],
    body: "Nossa equipe atuou de forma rápida e coordenada, com frentes específicas para resolver os problemas e fortalecer a plataforma.",
    plate: "/hero/frame-03",
    layout: { top: 225, title: 61, bodyWidth: 380 },
    alt: "Na sala de controle, a equipe observa painéis: monitoramento proativo, reforço de infraestrutura, processo de deploy e validações, plano de contingência, suporte dedicado e comunicação.",
    focusX: 0.52,
    glows: [
      { x: 900, y: 290, w: 300, h: 240, color: CYAN, kind: "card" },
      { x: 1218, y: 245, w: 340, h: 260, color: CYAN, kind: "card" },
      { x: 933, y: 470, w: 310, h: 220, color: CYAN, kind: "card" },
      { x: 1252, y: 443, w: 340, h: 230, color: CYAN, kind: "card" },
      { x: 1178, y: 631, w: 360, h: 210, color: CYAN, kind: "card" },
    ],
  },
  {
    chapter: 4,
    tone: "stable",
    duration: 6000,
    eyebrow: "Estabilidade",
    lines: ["A jornada", "segue em frente."],
    body: "Com os problemas resolvidos e a plataforma estabilizada, as Olimpíadas seguem em plena atividade para que os estudantes continuem explorando, aprendendo e conquistando.",
    plate: "/hero/frame-04",
    layout: { top: 224, title: 77, bodyWidth: 390 },
    alt: "O explorador sorri diante de painéis verdes: acessos normalizados, plataforma estável, Olimpíadas em funcionamento, experiência mais segura, melhorias em andamento.",
    focusX: 0.5,
    glows: [
      { x: 945, y: 332, w: 290, h: 200, color: TEAL, kind: "card" },
      { x: 1245, y: 298, w: 330, h: 220, color: TEAL, kind: "card" },
      { x: 947, y: 500, w: 290, h: 200, color: TEAL, kind: "card" },
      { x: 1251, y: 480, w: 330, h: 210, color: TEAL, kind: "card" },
      { x: 1099, y: 672, w: 380, h: 200, color: TEAL, kind: "card" },
      { x: 1382, y: 660, w: 260, h: 260, color: SUN, kind: "sun" },
    ],
  },
  {
    chapter: 5,
    tone: "evolve",
    duration: 7000,
    eyebrow: "A jornada continua",
    lines: ["Tivemos uma semana", "fora da normalidade."],
    sub: ["Entendemos o que aconteceu.", "Agimos. E estamos evoluindo."],
    body: "Seguimos juntos por uma PLEI cada vez melhor, com mais estabilidade, mais aprendizado e mais conquistas.",
    plate: "/hero/frame-05",
    layout: { top: 211, title: 70, bodyWidth: 452 },
    alt: "O explorador, sentado na rocha, contempla a cidade futurista e um feixe de luz no horizonte.",
    focusX: 0.5,
    glows: [
      { x: 1263, y: 390, w: 44, h: 280, color: "200,240,255", kind: "beam" },
      { x: 1263, y: 490, w: 340, h: 340, color: SUN, kind: "sun" },
    ],
  },
];

/**
 * Vídeo do hero (opcional). Coloque o arquivo em /public/hero/.
 * Sem o vídeo, o hero anima as plates dos frames; o frame 1 é o poster.
 */
export const heroMedia = {
  video: "/hero/plei-hero.mp4",
  poster: "/hero/frame-01.jpg",
  /** ligue quando o vídeo existir (evita uma requisição 404 enquanto não houver) */
  videoEnabled: false,
};

/* ————————————————————————— O QUE ACONTECEU ————————————————————————— */

export const whatHappened = {
  /** [parte em branco, parte com gradiente] */
  title: ["O que", "aconteceu?"],
  alt: "Ilustração: um planeta com órbitas e três avisos flutuando ao redor: não consigo acessar, problemas no cadastro e vínculo, dificuldades nas avaliações.",
  body: [
    "Nas últimas semanas, registramos um volume de ocorrências acima do comportamento esperado em alguns fluxos da PLEI. Os principais relatos estiveram concentrados em acesso e credenciais, cadastro e vínculo de alunos, avaliações e outros fluxos operacionais.",
    "Isso aconteceu justamente durante as Olimpíadas, o Zerando a PLEI, um dos momentos de maior engajamento dos estudantes na plataforma.",
  ],
};

export const olympics = {
  eyebrow: "Zerando a PLEI",
  title: ["Durante as Olimpíadas,", "cada minuto de acesso importa."],
  body: "Sabemos que o momento tornou cada instabilidade ainda mais sensível. Estudantes estavam explorando, competindo e aprendendo, e a plataforma precisava estar à altura dessa energia.",
  closing: ["Quando a jornada importa,", "a plataforma precisa estar pronta para acompanhar."],
};

/* ————————————————————————— HISTÓRIA TÉCNICA: ACESSO ————————————————————————— */

export interface StoryBlock {
  kind: "contexto" | "fato" | "hipotese" | "acao" | "plano";
  text: string;
  source: Source;
}

export interface AccessStep {
  id: string;
  n: string;
  tab: string;
  title: string;
  lead: string;
  blocks: StoryBlock[];
  visual: "search" | "migration" | "classroom" | "limit" | "shield";
}

export const accessStory: AccessStep[] = [
  {
    id: "indexacao",
    n: "01",
    tab: "Endereço errado",
    title: "Alguns estudantes estavam chegando ao endereço errado.",
    lead: "Páginas de validação da Jovens Gênios, disponíveis online para testes com alguns clientes, foram indexadas automaticamente pelo Google.",
    blocks: [
      {
        kind: "fato",
        text: "Estudantes que buscavam por “Jovens Gênios” encontravam esses links na pesquisa e entendiam que deveriam acessá-los. Isso gerou diferentes cenários de problemas de acesso.",
        source: "docx",
      },
      {
        kind: "acao",
        text: "Solicitamos de imediato a remoção temporária das indexações e, em seguida, removemos definitivamente a disponibilidade desses links, para evitar novas confusões.",
        source: "docx",
      },
    ],
    visual: "search",
  },
  {
    id: "migracao",
    n: "02",
    tab: "Migração de senhas",
    title: "A migração de autenticação também trouxe um comportamento inesperado.",
    lead: "Evoluímos nosso mecanismo de autenticação para ferramentas mais robustas, seguras e flexíveis, com um algoritmo de proteção de senhas mais resistente a ataques de força bruta.",
    blocks: [
      {
        kind: "contexto",
        text: "Para garantir compatibilidade, as senhas existentes seguiriam no padrão anterior, que continua seguro e amplamente usado no mercado, até a migração plena, prevista para o fim do ano letivo e alinhada ao calendário do município.",
        source: "docx",
      },
      {
        kind: "fato",
        text: "Por uma falha interna em uma das atualizações semanais de acessos de São José dos Campos, uma parcela significativa das senhas foi migrada antes do previsto. As senhas passaram ao mecanismo mais seguro, mas isso gerou problemas de acesso.",
        source: "docx",
      },
      {
        kind: "acao",
        text: "Assim que percebemos o incidente, ativamos uma camada de segurança que já estava em testes e que solicita a troca da senha quando o acesso é feito com a senha padrão. Também notificamos o município sobre o uso da senha padrão para quem não conseguia entrar com a senha anterior.",
        source: "docx",
      },
    ],
    visual: "migration",
  },
  {
    id: "429",
    n: "03",
    tab: "Erro inesperado",
    title: "Encontramos outro ponto.",
    lead: "Mesmo com essas soluções, alguns problemas de acesso continuavam. Ao analisar nossos logs, identificamos picos esporádicos do código HTTP 429 em aplicações associadas a São José dos Campos.",
    blocks: [
      {
        kind: "contexto",
        text: "O 429 (“Too Many Requests”) é a resposta do servidor quando recebe solicitações demais em pouco tempo. É uma proteção configurada para impedir que atacantes explorem rotas da aplicação com ataques de requisições massivas.",
        source: "docx",
      },
      {
        kind: "fato",
        text: "Para o estudante, isso aparecia na tela como: “Erro inesperado. Tente novamente.”",
        source: "docx",
      },
    ],
    visual: "classroom",
  },
  {
    id: "cenario",
    n: "04",
    tab: "O cenário mudou",
    title: "A proteção estava funcionando como deveria. Mas o cenário de uso mudou.",
    lead: "A configuração padrão limitava os logins por IP público e rota, e não por estudante: 3 logins a cada 10 segundos. A 4ª tentativa no mesmo intervalo recebia o 429.",
    blocks: [
      {
        kind: "fato",
        text: "Em uma sala em que todos usam a mesma rede, estudantes com contas diferentes passam a disputar o mesmo contador, e o bloqueio pode acontecer em segundos.",
        source: "docx",
      },
      {
        kind: "fato",
        text: "Esse limite não se mostrava um problema em outros cenários de uso, como o contraturno, o acesso residencial ou a internet móvel.",
        source: "docx",
      },
      {
        kind: "hipotese",
        text: "A concentração de acessos simultâneos pelo mesmo roteador durante a Olimpíada, provavelmente configurado com IP fixo, acionou o mecanismo de segurança. É provável que isso explique também problemas esporádicos concentrados em um dos endereços de acesso dos alunos, enquanto outro parecia funcionar.",
        source: "docx",
      },
      {
        kind: "contexto",
        text: "Não se trata de uma falha da escola ou da rede: era um cenário de uso legítimo que a nossa arquitetura precisava contemplar.",
        source: "brief",
      },
    ],
    visual: "limit",
  },
  {
    id: "evolucao",
    n: "05",
    tab: "Proteção evoluída",
    title: "Evoluímos a proteção.",
    lead: "Ajustamos o mecanismo para o cenário real de uso em sala, sem abrir mão da segurança.",
    blocks: [
      { kind: "acao", text: "Ampliamos o limite padrão de requisições na mesma janela de tempo.", source: "docx" },
      { kind: "acao", text: "Reforçamos, no próprio servidor, a proteção contra possíveis ataques DDoS.", source: "docx" },
    ],
    visual: "shield",
  },
];

/* ————————————————————————— DO PROBLEMA À SOLUÇÃO ————————————————————————— */

export interface SolutionCard {
  categoryId: "acesso_credenciais" | "cadastro_alunos" | "avaliacoes" | "profissionais" | "atividades";
  title: string;
  problem: string;
  identified: { text: string; certainty: Certainty }[];
  did: string[];
  prevention: { text: string; status: ImprovementStatus }[];
}

export const solutions: SolutionCard[] = [
  {
    categoryId: "acesso_credenciais",
    title: "Acesso e credenciais",
    problem: "Estudantes e profissionais não conseguiam entrar: senha incorreta, “usuário não encontrado” ou “Erro inesperado”.",
    identified: [
      { text: "Páginas de validação indexadas pelo Google levavam a endereços errados.", certainty: "fato" },
      { text: "Parte das senhas foi migrada antes do previsto por uma falha interna.", certainty: "fato" },
      { text: "Limite de login por IP compartilhado em sala acionava o erro 429.", certainty: "hipotese" },
    ],
    did: [
      "Remoção das indexações e dos links de validação",
      "Camada de troca da senha padrão ativada",
      "Limite de requisições ampliado e proteção DDoS reforçada",
      "Reset de senha e orientação de novo acesso em cada chamado",
    ],
    prevention: [
      { text: "Parâmetros de proteção revisados para o uso em sala", status: "implementado" },
      { text: "Migração plena das senhas até o fim do ano letivo", status: "planejado" },
      { text: "Monitoramento do comportamento coletivo de login", status: "planejado" },
    ],
  },
  {
    categoryId: "cadastro_alunos",
    title: "Cadastro e vínculo de alunos",
    problem: "O aluno não aparecia na escola ou na turma, a plataforma pedia “código da turma”, ou alunos transferidos continuavam na lista.",
    identified: [
      { text: "Movimentações de matrícula (inclusões, transferências e reclassificações) ainda não refletidas na plataforma.", certainty: "fato" },
    ],
    did: [
      "Inclusão, transferência e retirada de turmas e escolas",
      "Correção de cadastros duplicados ou ausentes",
      "Atualização conforme a base enviada pela Secretaria",
    ],
    prevention: [{ text: "Validações de cadastro e acompanhamento preventivo", status: "planejado" }],
  },
  {
    categoryId: "avaliacoes",
    title: "Avaliações e provas",
    problem: "Datas e horários, liberação ou bloqueio, presença do aluno na prova e acesso a relatórios e resultados.",
    identified: [{ text: "Configurações de prova e vínculos de alunos que exigiam revisão caso a caso.", certainty: "fato" }],
    did: [
      "Revisão de datas, horários, liberação e bloqueio",
      "Ajuste da presença dos alunos na prova",
      "Orientação passo a passo para desbloqueio e relatórios",
    ],
    prevention: [{ text: "Processos de validação e monitoramento das avaliações", status: "planejado" }],
  },
  {
    categoryId: "profissionais",
    title: "Cadastro de profissionais",
    problem: "Professores e gestores com escola, função ou turmas desatualizadas após mudanças de lotação.",
    identified: [{ text: "Mudanças de escola, função e atribuição de turmas ainda não refletidas nos perfis.", certainty: "fato" }],
    did: ["Ajuste de cadastros e escola de vínculo", "Correção de perfis (professor, gestão, coordenação)", "Associação das turmas corretas"],
    prevention: [{ text: "Validações de cadastro e acompanhamento preventivo", status: "planejado" }],
  },
  {
    categoryId: "atividades",
    title: "Conteúdo pedagógico",
    problem: "Disciplinas, componentes ou habilidades indisponíveis na hora de criar atividades.",
    identified: [{ text: "Perfis sem os componentes curriculares correspondentes às turmas.", certainty: "fato" }],
    did: ["Liberação de componentes curriculares, disciplinas e habilidades"],
    prevention: [{ text: "Validações de cadastro e acompanhamento preventivo", status: "planejado" }],
  },
];

/** Resoluções descritas — validadas contra as devolutivas da base bruta. */
export const resolutions = [
  { title: "Credenciais", text: "Reset de senha e orientação de novo acesso; em alguns casos, indicação do e-mail/login correto." },
  { title: "Cadastros e turmas", text: "Ajustes de cadastro, escola de vínculo, perfis (professor, gestão, coordenação) e associação de turmas." },
  { title: "Alunos", text: "Inclusão, transferência e retirada de turmas e escolas, além da correção de cadastros duplicados ou ausentes." },
  { title: "Avaliações", text: "Revisão de datas e horários, liberação e bloqueio, presença na prova e acesso a relatórios e resultados." },
  { title: "Conteúdo", text: "Liberação de componentes curriculares, disciplinas e habilidades para a criação de atividades." },
  { title: "Exceções", text: "Orientação para nova tentativa após o ajuste, encaminhamento para verificação ou pedido de mais detalhes." },
];

/* ————————————————————————— LINHA DO TEMPO ————————————————————————— */

export const timeline = [
  {
    title: "Identificação",
    text: "Chamados das escolas pelo formulário de ocorrências e relatos de erro em sala.",
    evidence: "Relatos de “Erro inesperado” na base a partir de",
  },
  { title: "Investigação", text: "Análise de logs, reprodução dos casos e leitura dos cenários de uso.", evidence: "Picos esporádicos de HTTP 429 identificados nos logs." },
  { title: "Correção", text: "Remoção de indexações, camada de troca de senha, limites ampliados e ajustes de cadastro.", evidence: "Ações documentadas no relatório técnico." },
  { title: "Validação", text: "Testes de acesso nas contas afetadas antes de devolver cada chamado.", evidence: "Devolutivas registram os testes realizados." },
  { title: "Melhoria contínua", text: "Frentes estruturais para reduzir a chance de recorrência.", evidence: "Ver “O que mudou”." },
];

/* ————————————————————————— O QUE MUDOU ————————————————————————— */

export interface Improvement {
  n: string;
  title: string;
  text: string;
  status: ImprovementStatus;
  /** o que sustenta o status; vazio = sem evidência nos arquivos */
  evidence?: string;
  icon: "radar" | "server" | "deploy" | "contingency" | "support";
}

export const improvements: Improvement[] = [
  {
    n: "01",
    title: "Monitoramento proativo",
    text: "Alertas e painéis para identificar anomalias em tempo real, inclusive de comportamento coletivo.",
    status: "implementado",
    icon: "radar",
  },
  {
    n: "02",
    title: "Infraestrutura",
    text: "Limite de requisições ampliado e proteção contra DDoS reforçada no servidor, preparando a plataforma para picos de uso em sala.",
    status: "implementado",
    evidence: "Relatório técnico: limite ampliado e proteção DDoS reforçada.",
    icon: "server",
  },
  {
    n: "03",
    title: "Processo de deploy",
    text: "Janelas, validações e controles para reduzir impactos de atualizações durante o horário de uso.",
    status: "implementado",
    icon: "deploy",
  },
  {
    n: "04",
    title: "Plano de contingência",
    text: "Procedimentos definidos para resposta rápida em situações críticas.",
    status: "implementado",
    icon: "contingency",
  },
  {
    n: "05",
    title: "Comunicação e suporte",
    text: "Canais mais ágeis com o CITE e materiais de orientação para as escolas.",
    status: "em_andamento",
    icon: "support",
  },
];

export const alreadyDone = [
  "Indexações indevidas removidas e links de validação retirados do ar",
  "Camada de troca da senha padrão ativada",
  "Limite de requisições ampliado para o uso em sala",
  "Proteção contra DDoS reforçada no servidor",
];

export const statusLabel: Record<ImprovementStatus, string> = {
  implementado: "Implementado",
  em_andamento: "Em andamento",
  planejado: "Planejado",
};

/* ————————————————————————— APRENDIZADOS ————————————————————————— */

export const learnings = [
  { title: "Acesso simultâneo", text: "Cenários de acesso simultâneo precisam ser considerados desde a camada de proteção." },
  { title: "Comportamento coletivo", text: "Experiências de autenticação precisam ser monitoradas também pelo comportamento coletivo, não só individual." },
  { title: "Alta demanda", text: "Momentos de alta demanda, como as Olimpíadas, exigem observabilidade específica." },
  { title: "Além do chamado", text: "Resolver o incidente é apenas a primeira etapa. O aprendizado precisa virar melhoria estrutural." },
];

/* ————————————————————————— COMPROMISSO ————————————————————————— */

export const commitment = {
  eyebrow: "Nosso compromisso",
  title: ["Seguimos juntos.", "Por uma PLEI cada vez melhor."],
  body: [
    "Reconhecemos o impacto causado pelos incidentes e entendemos a importância de oferecer uma experiência estável, segura e confiável para os estudantes.",
    "Estamos trabalhando para reduzir recorrências, aumentar nossa capacidade de detecção e responder cada vez mais rápido, transformando cada aprendizado em evolução.",
  ],
  pillars: ["Mais estabilidade", "Mais aprendizado", "Mais conquistas"],
  signature: "Esse é o nosso compromisso com São José dos Campos e com todos os estudantes da PLEI.",
};

/* ————————————————————————— CATEGORIAS ————————————————————————— */

/** O que entra em cada categoria (critério de classificação, sem dados pessoais). */
export const categoryInfo: Record<string, { short: string; description: string }> = {
  cadastro_alunos: {
    short: "Cadastro e vínculo de alunos",
    description: "Inclusão, transferência, retirada e vínculo de alunos a escolas e turmas, inclusive o aviso de “código da turma”.",
  },
  acesso_credenciais: {
    short: "Acesso e credenciais",
    description: "Senha incorreta, “usuário não encontrado”, “Erro inesperado” e pedidos de reset de senha.",
  },
  multiplos: {
    short: "Casos múltiplos",
    description: "Registros enviados como “múltipla professor e/ou aluno”, com o detalhe em anexo. Mantidos como categoria própria.",
  },
  avaliacoes: {
    short: "Avaliações e provas",
    description: "Presença do aluno na prova, liberação e bloqueio, datas e acesso a relatórios e resultados.",
  },
  profissionais: {
    short: "Profissionais",
    description: "Escola, função (professor, gestão, coordenação) e turmas de professores e gestores.",
  },
  atividades: {
    short: "Conteúdo pedagógico",
    description: "Disciplinas, componentes e habilidades para criar atividades, e atividades que não apareciam.",
  },
  funcionalidade: {
    short: "Funcionalidade e desempenho",
    description: "Telas que não abriam, travamentos, repetição de questões e inconsistência de resultados.",
  },
  outros: {
    short: "Outros",
    description: "Relatos sem tema identificável, registros de teste do formulário e análises de pontuação atípica.",
  },
};
