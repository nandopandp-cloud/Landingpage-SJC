# Reconciliação dos dados — PLEI / SJC

Documento interno. Registra como cada número da landing page foi obtido, onde as fontes divergem
e o que ainda precisa de confirmação do time antes de publicar.

## 1. Fontes

| Fonte | O que é | Uso na página |
|---|---|---|
| `Ocorrências PLEI 2026 (respostas).xlsx` | Base bruta do formulário (aba “Respostas ao formulário 1”) | **Todos os números** (via `scripts/aggregate_incidents.py`) |
| `analise-ocorrencias-plei.html` | Análise consolidada anterior | Taxonomia de categorias e texto das resoluções (validados contra a base) |
| `Problemas de acesso - SJC.docx` | Detalhamento técnico dos problemas de acesso | História técnica, ações e hipóteses |

Nenhum dos três arquivos entra no repositório (`.gitignore`).

## 2. Total e status

| | HTML (análise anterior) | Base bruta | Publicado |
|---|---|---|---|
| Registros | 405 | **404** (linhas 2–405 da planilha, sem lacunas) | 404 |
| Resolvido | 391 | 390 “Resolvido” + 1 “RESOLVIDO” = **391** | 391 |
| Em análise | 2 | 2 | 2 |
| Orientado | 1 | 1 | 1 |
| Sem status | 11 | **10** | 10 |
| % resolvido | 96,54% (391/405) | **96,78%** (391/404) | 96,78% |

**Onde está a diferença:** o único número que diverge é “sem status” (11 × 10). Ou seja, a análise
anterior contou um registro a mais, e esse registro não tinha status.

**Origem:** não foi possível confirmar. Duas explicações são compatíveis com os dados, e **nenhuma
foi assumida como verdadeira**:

- a análise cita como fonte uma *cópia* da planilha, que pode ter tido uma linha a mais (ex.: uma
  resposta removida depois da original);
- a última linha preenchida da planilha é a **linha 405**; se o total foi lido pelo número da linha
  (que inclui o cabeçalho) e “sem status” foi calculado como resto, o resultado seria 405 e 11.

**Decisão:** publicar os números da base bruta, que são auditáveis linha a linha.

### Qualidade da base

- A única linha com “RESOLVIDO” em maiúsculas (linha 61) tem texto sem conteúdo (“FDHDFHDFH”).
- A linha 298 diz “Teste para verificar a devolução da ocorrência”.
- As duas parecem testes do formulário. Foram **mantidas** na contagem para preservar a
  correspondência 1:1 com a base, e a metodologia da página informa isso. Se o time decidir
  excluí-las, o total vira 402 e o percentual de resolvidos, 389/402 = 96,77%.

## 3. Categorias

As categorias do HTML resultam de uma classificação qualitativa que não pode ser reproduzida
exatamente a partir da base. A página usa uma **reclassificação reproduzível**: regras explícitas
mais overrides justificados por linha, em `scripts/aggregate_incidents.py`. O resultado por linha,
sem nenhum dado pessoal, está em `docs/auditoria/classificacao-por-linha.csv`.

| Categoria | HTML | Base bruta (reclassificada) | Δ |
|---|---:|---:|---:|
| Cadastro e vínculo de alunos | 112 | 116 | +4 |
| Acesso e credenciais | 97 | 105 | +8 |
| Casos múltiplos sem detalhe no formulário | 64 | 64 | 0 |
| Avaliações e provas | 51 | 41 | −10 |
| Cadastro, perfil e turmas de profissionais | 28 | 45 | +17 |
| Atividades e conteúdo pedagógico | 24 | 18 | −6 |
| Outros / classificação inconclusiva | 21 | 7 | −14 |
| Funcionalidade, interface e desempenho | 8 | 8 | 0 |
| **Total** | **405** | **404** | −1 |

O que se mantém nas duas leituras:

- **64 “múltiplos”** batem exatamente: correspondem ao campo do formulário “MÚLTIPLA PROFESSOR E/OU ALUNO”.
- Os dois maiores temas são os mesmos (cadastro/vínculo de alunos e acesso/credenciais) e, somados,
  passam de 50% (HTML: 51,60%; base: 54,70%).
- A ordem “avaliações” vem logo depois dos dois temas principais e de “múltiplos”, junto de “profissionais”.

Principais critérios que explicam as diferenças:

- Pedidos de **reset de senha de professores** foram para *Acesso e credenciais*; mudanças de
  escola, função e turma de profissionais foram para *Profissionais*.
- “Aluno sem acesso” resolvido **criando ou vinculando o cadastro** foi para *Cadastro de alunos*;
  resolvido com **reset de senha**, para *Acesso*.
- Relatos centrados na **prova** (presença, desbloqueio, reabertura) foram para *Avaliações*;
  transferências em que a prova é só o motivo da urgência, para *Cadastro de alunos*.

Para voltar a publicar os valores do HTML, os valores estão em `previousAnalysisReference`
(`src/data/incidents.ts`). Nesse caso, porém, o total teria de ser 405, sem conciliação com a base.

## 4. Período e “uma semana fora da normalidade”

- A base cobre **07/04 a 25/09/2026** (~24 semanas), não uma única semana. A página deixa isso
  explícito sempre que mostra o total.
- Semana de **21 a 25/09**: 36 registros, **3× a semana anterior** (12). É a semana das
  Olimpíadas (“Zerando a PLEI” aparece citado em registros de 16/09 e 25/09).
- **O maior pico da série foi na semana de 04/05 (75 registros)**, concentrado em casos múltiplos,
  cadastro de alunos e avaliações. A página mostra esse pico no gráfico semanal, sem atribuir
  causa, porque ocultá-lo contradiria a proposta de transparência.
- Relatos com a mensagem “Erro inesperado” aparecem na base a partir de **17/09** (5 registros).
  Relatos de “erro de senha, mas ao clicar em enter algumas vezes o acesso conclui” aparecem a
  partir de 09/09 (3 registros). Isso é coerente com o 429 descrito no DOCX. A página **não afirma**
  essa relação como causa.

## 5. Fatos, hipóteses e ações (DOCX)

| Tema | Classificação na página | Observação |
|---|---|---|
| Páginas de validação indexadas pelo Google | Fato | Remoções solicitadas entre 10 e 18/08/2026 (evidência no DOCX). URLs internas **não** são exibidas. |
| Migração antecipada de senhas | Fato (“por uma falha interna”) | O DOCX assume a falha. A página não diz que o mecanismo anterior era inseguro. |
| Camada de troca de senha padrão + notificação ao município | Ação | — |
| Picos de HTTP 429 nos logs | Fato | — |
| Limite padrão: 3 logins / 10 s por IP público + rota | Fato | Número publicado porque é o valor **antigo**, já ampliado. Remova se preferir não expor. |
| Sala com IP fixo durante a Olimpíada acionou o limite | **Hipótese** (“principal hipótese”) | Exibida com selo “Principal hipótese”. |
| Problemas concentrados em um dos endereços | **Hipótese** (“é provável”) | Idem. |
| Limite ampliado + proteção DDoS reforçada | Ação | — |
| Migração plena até o fim do ano letivo | Plano | Exibida como “Planejado”. |

## 6. Status das frentes estruturais

Status definidos pelo time (decisão registrada em 27/09/2026) e exibidos na seção “O que mudou”:

| Frente | Status | Evidência nos arquivos de origem |
|---|---|---|
| 01 Monitoramento proativo | Implementado | Confirmação do time (não consta nos arquivos) |
| 02 Infraestrutura | Implementado | DOCX: limite ampliado e proteção DDoS reforçada |
| 03 Processo de deploy | Implementado | Confirmação do time (não consta nos arquivos) |
| 04 Plano de contingência | Implementado | Confirmação do time (não consta nos arquivos) |
| 05 Comunicação e suporte | Em andamento | Confirmação do time |

Com isso, o hero (frames 3 e 4) e a seção “O que mudou” ficam coerentes entre si.

Ainda aparecem como “Planejado” nos cards de “Do problema à solução” (`solutions[].prevention`):
“Migração plena das senhas até o fim do ano letivo” (plano documentado no DOCX), “Monitoramento do
comportamento coletivo de login” e “Validações de cadastro e acompanhamento preventivo”. Se já estiverem
em curso, ajustem os status para manter a página consistente.

## 7. Privacidade

- O único arquivo de dados consumido pela página é `src/data/incidents.generated.json`, que contém
  só agregados.
- `python3 scripts/aggregate_incidents.py <xlsx> --scan dist` varre o build atrás de nomes, e-mails,
  escolas e demais campos identificáveis da planilha. A última execução não encontrou nada.
- `index.html` usa `noindex, nofollow`: a página é uma prestação de contas para o cliente e não deve
  aparecer em buscadores (o próprio incidente de indexação é um bom motivo).
