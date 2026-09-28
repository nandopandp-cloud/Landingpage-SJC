#!/usr/bin/env python3
"""
Camada de transformação: XLSX bruto → dados agregados (sem dados pessoais).

    python3 scripts/aggregate_incidents.py "<caminho>/Ocorrências PLEI 2026 (respostas).xlsx"
    python3 scripts/aggregate_incidents.py "<xlsx>" --scan dist   # varre o build atrás de dados pessoais

Saídas:
  src/data/incidents.generated.json   → único arquivo consumido pela landing page (só agregados)
  docs/auditoria/classificacao-por-linha.csv → nº da linha na planilha + categoria + status
                                               (sem nomes, e-mails, escolas ou textos livres)

A planilha NUNCA deve ser copiada para dentro do repositório (ver .gitignore).
Requer: pip install openpyxl
"""
from __future__ import annotations

import csv
import datetime as dt
import json
import re
import sys
import unicodedata
from collections import Counter, OrderedDict
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
OUT_JSON = ROOT / "src" / "data" / "incidents.generated.json"
OUT_AUDIT = ROOT / "docs" / "auditoria" / "classificacao-por-linha.csv"

# Índices de coluna (0-based) da aba "Respostas ao formulário 1"
C_TS, C_EMAIL, C_SCHOOL, C_REQUESTER, C_ROLE, C_KIND = 0, 1, 2, 3, 4, 5
C_DESC_STUDENT, C_STUDENT_ID, C_STUDENT_DOB, C_STUDENT_CLASS = 6, 7, 8, 9
C_DESC_TEACHER, C_TEACHER_NAME, C_TEACHER_EMAIL, C_TEACHER_CLASSES = 10, 11, 12, 13
C_UPLOAD, C_REPLY, C_STATUS = 14, 15, 16

# Colunas com dados pessoais / identificáveis — usadas apenas pelo scanner de vazamento.
PII_COLUMNS = [
    C_EMAIL, C_SCHOOL, C_REQUESTER, C_STUDENT_ID, C_STUDENT_DOB, C_STUDENT_CLASS,
    C_TEACHER_NAME, C_TEACHER_EMAIL, C_TEACHER_CLASSES, C_UPLOAD,
]

KIND_MAP = {
    "INDIVIDUAL ALUNO": "aluno",
    "INDIVIDUAL PROFESSOR": "profissional",
    "MÚLTIPLA PROFESSOR E/OU ALUNO": "multipla",
}

# Recorte do relatório: registros após esta data ficam de fora (a planilha segue recebendo respostas).
PERIOD_END = dt.date(2026, 9, 25)

# Taxonomia do HTML de análise, com os "casos múltiplos" divididos pela devolutiva da equipe.
CATEGORIES = OrderedDict([
    ("cadastro_alunos", "Cadastro e vínculo de alunos"),
    ("acesso_credenciais", "Acesso e credenciais"),
    ("avaliacoes", "Avaliações e provas"),
    ("profissionais", "Cadastro, perfil e turmas de profissionais"),
    ("atividades", "Atividades e conteúdo pedagógico"),
    ("outros", "Outros / classificação inconclusiva"),
    ("funcionalidade", "Funcionalidade, interface e desempenho"),
    ("multiplos_processo", "Casos múltiplos: reset de senha e ajustes de cadastro"),
    ("multiplos_plataforma", "Casos múltiplos: acesso e trilhas"),
    ("multiplos_sem_detalhe", "Casos múltiplos sem detalhe no formulário"),
])

# Enquadramento definido pelo time (28/09/2026): cadastro/vínculo de alunos, avaliações e os pedidos em lote
# de reset de senha e ajustes não eram falhas da plataforma, e sim ruídos de processo e comunicação.
GROUPS = OrderedDict([
    ("processo", ("Processo e comunicação", ["cadastro_alunos", "avaliacoes", "multiplos_processo"])),
    ("plataforma", ("Acesso e uso da plataforma", ["acesso_credenciais", "profissionais", "atividades", "funcionalidade", "outros", "multiplos_plataforma"])),
    ("sem_detalhe", ("Sem detalhe suficiente", ["multiplos_sem_detalhe"])),
])

# Registros "múltipla professor e/ou aluno": o relato fica em anexo, então o subtema vem da devolutiva.
# Exceções por linha onde a regra não basta (cada uma com justificativa).
MULTI_OVERRIDES: dict[int, tuple[str, str]] = {
    319: ("tecnico", "encaminhado ao time de Engenharia"),
    356: ("tecnico", "reportado ao time responsável"),
    241: ("tecnico", "instabilidade / erro em questão"),
    370: ("tecnico", "problema de acesso à Olimpíada"),
    397: ("orientacao", "conta funcionando; orientação sobre o endereço de acesso"),
    401: ("orientacao", "ranking oculto por regra da Zerando a PLEI"),
    359: ("perfil", "atividade não encontrada na conta da professora"),
    268: ("perfil", "diretora vinculada à escola correta"),
    212: ("reset", "turma já correta; senha da educadora resetada"),
    169: ("cadastro", "alunos retirados de turma (e um reset)"),
    107: ("cadastro", "alunos retirados da prova e da turma (transferência)"),
    165: ("cadastro", "alunas retiradas de turma e da prova (transferência)"),
    82: ("cadastro", "aluno cadastrado e conectado à prova"),
    94: ("cadastro", "cadastro de aluno criado"),
    167: ("cadastro", "cadastro de aluno criado"),
}
MULTI_SUB_TO_CAT = {
    "reset": "multiplos_processo",
    "cadastro": "multiplos_processo",
    "provas": "multiplos_processo",
    "perfil": "multiplos_processo",
    "orientacao": "multiplos_processo",
    "tecnico": "multiplos_plataforma",
    "sem_detalhe": "multiplos_sem_detalhe",
}

# Overrides manuais, por nº da linha na planilha (linha 1 = cabeçalho).
# Usados só onde as regras abaixo não capturam o tema dominante. Cada um tem justificativa.
OVERRIDES: dict[int, tuple[str, str]] = {
    # Relatos de "botões/abas não abrem" → interface (mesmo que a devolutiva tenha ajustado perfil)
    2: ("funcionalidade", "barra de ícones não abre nenhuma opção"),
    230: ("funcionalidade", "site não abre nenhuma opção"),
    270: ("funcionalidade", "aparecem apenas ícones, sem informações"),
    # Relatos de pontuação/ranking atípico na Olimpíada (análise de acesso, não falha de plataforma)
    203: ("outros", "suspeita de uso da conta por terceiros (ranking)"),
    208: ("outros", "suspeita de uso da conta por terceiros (ranking)"),
    222: ("outros", "suspeita de uso da conta por terceiros (ranking)"),
    223: ("outros", "suspeita de uso da conta por terceiros (ranking)"),
    # Resultado da Olimpíada divergente — devolutiva confirma inconsistência na plataforma
    240: ("funcionalidade", "inconsistência de resultado confirmada na devolutiva"),
    # Relatos amplos de estabilidade/progresso
    290: ("funcionalidade", "repetição de questões e demora na divulgação"),
    313: ("funcionalidade", "pontuação/avatar alterados e tarefas ausentes"),
    321: ("funcionalidade", "pontos, trilhas e travamentos (relato amplo)"),
    # Pedido de formação continuada (não é fluxo de estudantes)
    245: ("atividades", "inscrição em cursos de formação continuada"),
    # Solicitação administrativa (base de dados / turmas de outra escola)
    109: ("cadastro_alunos", "exclusão de turmas de outra escola"),
    170: ("cadastro_alunos", "atualização da base de alunos"),
    261: ("cadastro_alunos", "atualização da base de alunos"),
    294: ("cadastro_alunos", "aluno transferido ainda na turma (registrado como profissional)"),
    # Relato de profissional sobre prova (turma não aparece para atribuir prova)
    378: ("avaliacoes", "turmas não aparecem para atribuir a prova"),
    379: ("avaliacoes", "turmas não aparecem para atribuir a prova"),
    # Relato de aluno sobre prova registrado como professor
    98: ("avaliacoes", "prova não aparece para desbloqueio"),
    # Transferência urgente — tema dominante é o vínculo, a prova é o motivo da urgência
    318: ("cadastro_alunos", "transferência de turma/escola"),
    # Profissional pede vínculo à escola para acessar abas/relatórios
    204: ("profissionais", "vínculo como vice-diretora na escola"),
    210: ("profissionais", "coordenadora sem acesso ao relatório; vínculo às turmas"),
    # Profissional novo(a) sem cadastro
    352: ("profissionais", "cadastro de professora substituta"),
    242: ("profissionais", "cadastro de assessor da Secretaria"),
    # "Mensagem conta desativada" com devolutiva de reset → credenciais
    361: ("acesso_credenciais", "conta desativada; reset de senha"),
    # Aluno duplicado + sem acesso — tema dominante: cadastro
    368: ("cadastro_alunos", "aluno duplicado na turma"),
    # Relatos de senha que citam "cadastrar/escola" mas cuja questão é a credencial
    193: ("acesso_credenciais", "senha informada no cadastro não funciona"),
    254: ("acesso_credenciais", "e-mail não reconhecido; pedido de nova senha"),
    255: ("acesso_credenciais", "e-mail não reconhecido; pedido de nova senha"),
    256: ("acesso_credenciais", "e-mail não reconhecido; pedido de nova senha"),
    286: ("acesso_credenciais", "e-mail do aluno; devolutiva com nova senha"),
    340: ("acesso_credenciais", "senhas não funcionaram após o recesso"),
    367: ("acesso_credenciais", "erro inesperado mesmo após reset de senha"),
    402: ("acesso_credenciais", "e-mail ou senha incorretos mesmo após reset"),
    # Inclusão de disciplina no perfil → conteúdo pedagógico
    244: ("atividades", "inclusão de disciplina no perfil"),
    249: ("atividades", "inclusão de componente curricular no perfil"),
    # Dúvida sobre relatório de atividade da turma
    201: ("outros", "dúvida sobre status de alunos no relatório"),
}

RE_TEST = re.compile(r"^(fdh|fdg)|teste para verificar", re.I)
RE_EVAL = re.compile(r"prova|avalia|saresp|simulado|desbloque", re.I)
RE_FUNC = re.compile(r"trava|não carrega|nao carrega|lento|lentid|instabil", re.I)
RE_ACTIVITY = re.compile(
    r"atividade|tarefa|disciplina|componente|habilidade|quest(ão|ões|oes)|curso|forma(ç|c)ão continuada",
    re.I,
)
RE_CRED = re.compile(
    r"senha|e-?mail (inexistente|inv|não|nao)|inexistente|usu(á|a)rio n(ã|a)o (encontrado|econtrado|existe|cadastrado)"
    r"|n(ã|a)o existe|erro inesperado|erro ao entrar|dando erro|dados incorretos|incorret|inv(á|a)lid|login|c(ó|o)digo n(ã|a)o chega"
    r"|n(ã|a)o (est(á|a) )?conseg\w* (acess|entrar|logar)|sem acesso|n(ã|a)o (tem|possui) acesso|acess(o|ar) a plei|erro desconhecido",
    re.I,
)
RE_STUDENT_ENROLL = re.compile(
    r"transfer|retir|exclu|inclu|inser|n(ã|a)o consta|n(ã|a)o est(á|a) (cadastrad|inserid|matriculad|vinculad|na sala)"
    r"|cadastr|matricul|duplicad|repetido|escola (anterior|antiga)|outra escola|c(ó|o)digo (da|de) (turma|acesso|escola)"
    r"|pede c(ó|o)digo|solicitando c(ó|o)digo|pedindo c(ó|o)digo|n(ã|a)o pertence|reclassific|mudou do|trocar? de turma|nome social"
    r"|sem turma|vincul|na sala|da sala|da turma|c(ó|o)digo da sua turma|alun[oa] nov[oa]|inscrit|emefi|emfi|escola",
    re.I,
)
RE_REPLY_ENROLL = re.compile(
    r"n(ã|a)o (estava|tinha) cadastr|sem cadastro|cadastro (da|do) alun\w* (foi )?(criado|realizado)|foi cadastrad|realizamos o cadastro"
    r"|fizemos o cadastro|fazer o cadastro|cadastro d[oa] alun\w* .{0,60}(foi |j(á|a) foi )?(ajustado|atualizado|criado|realizado)|inserid\w* (na|em) turma|retirad|foi criado",
    re.I,
)
RE_REPLY_RESET = re.compile(r"senha (d\w+ )?.{0,60}resetad|resetei|resetamos|senha resetada", re.I)
RE_PRO_PROFILE = re.compile(
    r"turma|escola|perfil|gestor|gestão|coordenad|diretor|vice|fun(ç|c)(ã|a)o|cadastr|vincul|inclus|inclu|inser|criação de login"
    r"|lecion|atribu|relat(ó|o)rio|emefi|cp\b|gp\b",
    re.I,
)


def norm(v) -> str:
    if v is None:
        return ""
    return re.sub(r"\s+", " ", str(v)).strip()


def classify(row_no: int, kind: str, desc: str, reply: str) -> tuple[str, str]:
    """Retorna (categoria, regra aplicada). Tema dominante do relato; devolutiva só como desempate."""
    if row_no in OVERRIDES:
        cat, why = OVERRIDES[row_no]
        return cat, f"override: {why}"
    if kind == "multipla":
        sub, why = classify_multipla(row_no, reply)
        return MULTI_SUB_TO_CAT[sub], f"múltipla/{sub}: {why}"
    if desc and RE_TEST.search(desc):
        return "outros", "registro de teste"
    if not desc:
        if kind == "aluno" and RE_REPLY_ENROLL.search(reply):
            return "cadastro_alunos", "sem descrição; devolutiva indica ajuste de vínculo"
        return "outros", "sem descrição utilizável"
    if RE_EVAL.search(desc):
        return "avaliacoes", "relato cita prova/avaliação"
    if RE_FUNC.search(desc):
        return "funcionalidade", "relato cita travamento/instabilidade"

    if kind == "profissional":
        if RE_ACTIVITY.search(desc) and not re.search(r"turma|inclus|inclu", desc, re.I):
            return "atividades", "profissional: disciplinas/atividades"
        # credenciais só quando o relato é de senha/login sem pedido de vínculo
        if RE_CRED.search(desc) and not re.search(r"turma|escola|perfil|gestor|vincul|inclus|inclu", desc, re.I):
            return "acesso_credenciais", "profissional: senha/login"
        if re.search(r"resetar|reset|senha", desc, re.I) and not re.search(r"turma|escola|perfil|gestor|vincul|inclus", desc, re.I):
            return "acesso_credenciais", "profissional: pedido de reset"
        if RE_PRO_PROFILE.search(desc):
            return "profissionais", "profissional: perfil/escola/turmas"
        if RE_CRED.search(desc) or re.search(r"acesso|acessar", desc, re.I):
            return "acesso_credenciais", "profissional: sem acesso"
        return "outros", "profissional: sem tema identificável"

    # aluno
    if RE_ACTIVITY.search(desc) and not RE_STUDENT_ENROLL.search(desc):
        return "atividades", "aluno: atividades/tarefas"
    if RE_STUDENT_ENROLL.search(desc):
        return "cadastro_alunos", "aluno: inclusão/transferência/vínculo"
    if RE_CRED.search(desc) or re.search(r"resete|resetar|reset", desc, re.I):
        # desempate pela devolutiva: se o caso foi resolvido criando/ajustando vínculo, é cadastro
        if RE_REPLY_ENROLL.search(reply) and not RE_REPLY_RESET.search(reply):
            return "cadastro_alunos", "aluno: sem acesso, resolvido com cadastro/vínculo"
        return "acesso_credenciais", "aluno: senha/login"
    return "outros", "aluno: sem tema identificável"


def classify_multipla(row_no: int, reply: str) -> tuple[str, str]:
    """Subtema de um registro múltiplo a partir da devolutiva (o relato original está em anexo)."""
    if row_no in MULTI_OVERRIDES:
        return MULTI_OVERRIDES[row_no]
    r = reply.lower()
    if not r or re.search(r"não há descrição|não consegui identificar|preencha o formulário novamente", r):
        return "sem_detalhe", "devolutiva sem detalhe do caso"
    if re.search(r"engenharia|time responsável|instabilidade", r):
        return "tecnico", "encaminhado para análise técnica"
    if re.search(r"senha", r) and re.search(r"resetad|senha de todos|senha do aluno|senha \d|nova senha|senha: ?\d|senhas", r):
        return "reset", "reset de senha"
    if re.search(r"retirad|transferid|cadastr|turma correta|já (está|consta|aparece) na (lista|turma)|escola correta", r):
        return "cadastro", "ajuste de cadastro / turma"
    if re.search(r"prova|avaliação", r):
        return "provas", "prova / avaliação"
    if re.search(r"perfil|ajustado para (cp|vd)|foi ajustado de", r):
        return "perfil", "perfil de profissional"
    return "sem_detalhe", "devolutiva genérica (detalhe só no anexo)"


def normalize_status(v) -> str:
    s = norm(v)
    if not s:
        return "sem_status"
    key = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return {"resolvido": "resolvido", "em analise": "em_analise", "orientado": "orientado"}.get(key, "outro:" + s)


def pct(n: int, d: int) -> float:
    return round(100 * n / d, 2) if d else 0.0


def load_rows(xlsx: Path):
    wb = openpyxl.load_workbook(xlsx, data_only=True, read_only=True)
    ws = wb.worksheets[0]
    out = []
    for idx, r in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
        if any(norm(v) for v in r):
            r = tuple(r) + (None,) * (C_STATUS + 1 - len(r))
            if isinstance(r[C_TS], dt.datetime) and r[C_TS].date() > PERIOD_END:
                continue
            out.append((idx, r))
    return out


def monday(d: dt.date) -> dt.date:
    return d - dt.timedelta(days=d.weekday())


def aggregate(xlsx: Path) -> dict:
    rows = load_rows(xlsx)
    audit = []
    cats = Counter()
    status = Counter()
    kinds = Counter()
    weekly = Counter()
    weekly_cat: dict[dt.date, Counter] = {}
    schools = set()
    unexpected_error_mentions = []
    intermittent_login_mentions = []
    test_like = []

    for row_no, r in rows:
        kind = KIND_MAP[norm(r[C_KIND])]
        desc = norm(r[C_DESC_STUDENT]) or norm(r[C_DESC_TEACHER])
        reply = norm(r[C_REPLY])
        cat, rule = classify(row_no, kind, desc, reply)
        st = normalize_status(r[C_STATUS])
        ts: dt.datetime = r[C_TS]
        wk = monday(ts.date())

        cats[cat] += 1
        status[st] += 1
        kinds[kind] += 1
        weekly[wk] += 1
        weekly_cat.setdefault(wk, Counter())[cat] += 1
        schools.add(norm(r[C_SCHOOL]))
        if re.search(r"erro inesperado", desc, re.I):
            unexpected_error_mentions.append(ts.date())
        if re.search(r"(clicar|clicando).{0,30}enter", desc, re.I):
            intermittent_login_mentions.append(ts.date())
        if desc and RE_TEST.search(desc):
            test_like.append(row_no)
        audit.append({
            "linha_planilha": row_no,
            "data": ts.date().isoformat(),
            "tipo_registro": kind,
            "categoria": cat,
            "regra": rule,
            "status": st,
        })

    total = len(rows)
    assert sum(cats.values()) == total
    group_of = {c: g for g, (_, ids) in GROUPS.items() for c in ids}
    assert set(group_of) == set(CATEGORIES), "toda categoria precisa de um grupo"
    assert all(s in {"resolvido", "em_analise", "orientado", "sem_status"} for s in status), status

    dates = [r[C_TS].date() for _, r in rows]
    first, last = min(dates), max(dates)

    # Série semanal contínua (inclui semanas sem registros, p.ex. recesso de julho)
    series = []
    wk = monday(first)
    while wk <= monday(last):
        series.append({
            "weekStart": wk.isoformat(),
            "count": weekly.get(wk, 0),
            "byCategory": {k: weekly_cat.get(wk, Counter()).get(k, 0) for k in CATEGORIES},
        })
        wk += dt.timedelta(days=7)

    focus_start = monday(last)
    focus = next(s for s in series if s["weekStart"] == focus_start.isoformat())
    prev = next(s for s in series if s["weekStart"] == (focus_start - dt.timedelta(days=7)).isoformat())
    peak = max(series, key=lambda s: s["count"])

    return {
        "_meta": {
            "fonte": "Ocorrências PLEI 2026 (respostas).xlsx, aba 'Respostas ao formulário 1'",
            "geradoEm": dt.date.today().isoformat(),
            "metodo": "1 linha preenchida = 1 registro. Categoria = tema dominante do relato (devolutiva só como desempate).",
            "aviso": "Arquivo gerado. Não editar à mão: rode scripts/aggregate_incidents.py.",
        },
        "period": {"start": first.isoformat(), "end": last.isoformat()},
        "total": total,
        "status": {
            "resolvido": status["resolvido"],
            "emAnalise": status["em_analise"],
            "orientado": status["orientado"],
            "semStatus": status["sem_status"],
        },
        "resolutionRate": pct(status["resolvido"], total),
        "recordTypes": {
            "aluno": kinds["aluno"],
            "profissional": kinds["profissional"],
            "multipla": kinds["multipla"],
        },
        "schoolsCount": len(schools),
        "categories": [
            {"id": k, "label": CATEGORIES[k], "count": cats[k], "share": pct(cats[k], total), "group": group_of[k]}
            for k in sorted(CATEGORIES, key=lambda k: -cats[k])
        ],
        "groups": [
            {
                "id": g,
                "label": label,
                "categories": ids,
                "count": sum(cats[c] for c in ids),
                "share": pct(sum(cats[c] for c in ids), total),
            }
            for g, (label, ids) in GROUPS.items()
        ],
        "weekly": series,
        "focusWeek": {
            "weekStart": focus["weekStart"],
            "end": last.isoformat(),
            "count": focus["count"],
            "previousWeekCount": prev["count"],
            "byCategory": focus["byCategory"],
        },
        "peakWeek": {"weekStart": peak["weekStart"], "count": peak["count"], "byCategory": peak["byCategory"]},
        "signals": {
            "unexpectedErrorMentions": len(unexpected_error_mentions),
            "unexpectedErrorFirstSeen": min(unexpected_error_mentions).isoformat() if unexpected_error_mentions else None,
            "intermittentLoginMentions": len(intermittent_login_mentions),
            "intermittentLoginFirstSeen": min(intermittent_login_mentions).isoformat() if intermittent_login_mentions else None,
        },
        "dataQuality": {
            "testLikeRecords": len(test_like),
            "note": "Registros com texto de teste foram mantidos na contagem para preservar a correspondência 1:1 com a base.",
        },
    }, audit


def pii_tokens(xlsx: Path) -> set[str]:
    """Strings identificáveis da planilha (nomes, e-mails, escolas, turmas…) para varredura de vazamento."""
    tokens = set()
    em = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
    for _, r in load_rows(xlsx):
        for c in PII_COLUMNS:
            v = norm(r[c])
            # nomes, escolas e e-mails têm várias palavras ou "@"; palavras soltas ("história") não identificam ninguém
            if len(v) >= 6 and (" " in v or "@" in v):
                tokens.add(v.lower())
        for c in (C_DESC_STUDENT, C_DESC_TEACHER, C_REPLY):
            for m in em.findall(norm(r[c])):
                tokens.add(m.lower())
            # nomes em CAIXA ALTA nas devolutivas (3+ palavras)
            for m in re.findall(r"\b[A-ZÀ-Ý]{2,}(?: (?:D[AEO]S?|[A-ZÀ-Ý]{2,})){2,}\b", norm(r[c])):
                tokens.add(m.lower())
    return tokens


# Frases genéricas que aparecem em campos da planilha mas NÃO identificam ninguém
# (usadas na página por requisito do briefing). Cada inclusão aqui deve ser justificada.
SCAN_ALLOWLIST = {
    "não consigo acessar",  # chip do hero (briefing, cena 02)
}


def scan(xlsx: Path, target: Path) -> int:
    tokens = pii_tokens(xlsx) - SCAN_ALLOWLIST
    hits = []
    files = [p for p in target.rglob("*") if p.is_file() and p.suffix in {".js", ".html", ".json", ".css", ".txt", ".map", ".ts", ".tsx", ".csv", ".md"}]
    for p in files:
        text = p.read_text(errors="ignore").lower()
        for t in tokens:
            if t in text:
                hits.append((str(p.relative_to(target)), t[:3] + "…"))
    if hits:
        print(f"✗ {len(hits)} possíveis vazamentos de dados pessoais:")
        for f, t in hits[:50]:
            print("   ", f, t)
        return 1
    print(f"✓ Nenhum dado pessoal da planilha encontrado em {target} ({len(files)} arquivos, {len(tokens)} padrões verificados).")
    return 0


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 2
    xlsx = Path(argv[1]).expanduser()
    if "--scan" in argv:
        return scan(xlsx, Path(argv[argv.index("--scan") + 1]))

    data, audit = aggregate(xlsx)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_AUDIT.parent.mkdir(parents=True, exist_ok=True)
    with OUT_AUDIT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(audit[0].keys()))
        w.writeheader()
        w.writerows(audit)

    print(f"Registros: {data['total']}  ({data['period']['start']} → {data['period']['end']})")
    print(f"Status: {data['status']}  → resolvidos {data['resolutionRate']}%")
    for c in data["categories"]:
        print(f"  {c['count']:>4}  {c['share']:>6.2f}%  {c['label']}")
    print(f"Semana foco {data['focusWeek']['weekStart']}: {data['focusWeek']['count']} (anterior {data['focusWeek']['previousWeekCount']})")
    print(f"Pico: {data['peakWeek']}")
    print(f"Sinais: {data['signals']}")
    print(f"→ {OUT_JSON.relative_to(ROOT)}\n→ {OUT_AUDIT.relative_to(ROOT)}")
    return scan(xlsx, OUT_JSON.parent)


if __name__ == "__main__":
    sys.exit(main(sys.argv))
