# Landingpage-SJC

Landing page de prestação de contas sobre as ocorrências na **PLEI · Exploradores** em São José
dos Campos. É uma experiência narrativa: o que aconteceu, por que aconteceu, o que fizemos e o que
mudou.

**Stack:** Vite · React 19 · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) · Geist.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/ (site estático)
```

## Dados

```
XLSX bruto (fora do repo) → scripts/aggregate_incidents.py → src/data/incidents.generated.json → página
```

```bash
pip install openpyxl
npm run data -- "/caminho/Ocorrências PLEI 2026 (respostas).xlsx"
# depois do build, confirme que nada pessoal vazou:
python3 scripts/aggregate_incidents.py "/caminho/…xlsx" --scan dist
```

- **Nunca** coloque a planilha, o DOCX ou exports em CSV dentro do projeto (o `.gitignore` bloqueia).
- Números: `src/data/incidents.ts` (tipado, derivado do JSON gerado).
- Textos, status das frentes e hipóteses: `src/data/content.ts`. Cada afirmação indica a fonte.
- Divergências entre as fontes e itens a confirmar: **[docs/RECONCILIACAO.md](docs/RECONCILIACAO.md)**.
- Classificação linha a linha (sem dados pessoais): `docs/auditoria/classificacao-por-linha.csv`.

## Hero

O hero reproduz os 5 frames aprovados (`design/hero-frames/frame-01…05.png`), um por capítulo.

- Os frames trazem a UI gravada na imagem. `scripts/make_hero_plates.py` remove essa UI (menu,
  textos, botão, painel) e gera as **plates** limpas em `public/hero/frame-0N.webp/.jpg`, além do close
  usado em “O que aconteceu” e da cena do compromisso final.
  ```bash
  python3 -m venv .venv && .venv/bin/pip install opencv-python-headless numpy
  .venv/bin/python scripts/make_hero_plates.py
  ```
- A página redesenha a UI por cima, viva e acessível. No desktop em paisagem (proporção ≥ 1,45),
  plates, brilhos dos cards e painel de capítulos ficam presos às coordenadas da imagem, e a
  tipografia usa os tamanhos medidos em cada frame. No mobile e em tablet em pé, o texto vai para
  cima e a arte para baixo, recortada no personagem.
- Movimento: crossfade entre cenas, zoom lento de câmera, brilho que acende os cards em sequência,
  poeira estelar e relógio com pausa, navegação por capítulo e progresso.
- Textos, durações, posições e tipografia de cada cena ficam em `src/data/content.ts → heroBeats`.
- Para trocar um frame, substitua o PNG em `design/hero-frames/`, ajuste as caixas de texto e o painel
  em `FRAMES` no script e rode-o de novo.

### Vídeo (opcional)

1. Coloque `public/hero/plei-hero.mp4` (H.264, sem áudio, idealmente < 4 MB).
2. Em `src/data/content.ts`, defina `heroMedia.videoEnabled = true`.
3. Os capítulos seguem as durações de `heroBeats`: ajuste-as ao corte do vídeo.

O poster do vídeo é `public/hero/frame-01.jpg`.

## Acessibilidade e movimento

- `prefers-reduced-motion`: sem autoplay no hero, sem parallax e com as animações desligadas;
  todo o conteúdo fica visível.
- O hero pode ser pausado, navegado por capítulo e para sozinho ao fim da narrativa.
- Status e hipóteses sempre têm ícone e texto, nunca só cor.
- Os gráficos têm descrição textual e tabela alternativa.
