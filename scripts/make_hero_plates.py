#!/usr/bin/env python3
"""
Gera as "plates" do hero a partir dos frames de referência (design/hero-frames/frame-0N.png).

Os frames trazem a UI gravada na imagem (menu, título, texto, botão, painel de capítulos).
A página desenha essa UI ao vivo, então aqui ela é removida:
  1. menu e bloco de texto → máscara do que é mais claro que o entorno + inpainting;
  2. painel de vidro → "desescurece" a área (inverte o vidro) e reconstrói anéis/rótulos;
  3. saída em WebP + JPG de fallback (o JPG do frame 1 também é o poster do vídeo).

    python3 -m venv .venv && .venv/bin/pip install opencv-python-headless numpy
    .venv/bin/python scripts/make_hero_plates.py
"""
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design" / "hero-frames"
OUT = ROOT / "public" / "hero"

# Retângulos da UI gravada (coordenadas da imagem 1672×941), por frame.
# texts = uma caixa justa por linha (eyebrow, título, apoio, parágrafo, rótulo), para a limpeza
# nunca encostar no personagem; button = pílula branca; panel/pause = capítulos.
FRAMES = {
    1: dict(
        texts=[(98, 236, 336, 262), (98, 286, 566, 360), (98, 360, 734, 432), (98, 452, 560, 492), (330, 526, 574, 560)],
        button=(98, 512, 326, 574), panel=(1446, 233, 1646, 590), pause=(1546, 632),
    ),
    2: dict(
        texts=[(98, 206, 240, 234), (98, 254, 699, 318), (98, 318, 479, 378), (98, 378, 444, 438), (98, 454, 516, 572), (330, 602, 574, 638)],
        button=(100, 589, 328, 650), panel=(1446, 233, 1646, 594), pause=(1547, 637),
    ),
    3: dict(
        texts=[(98, 221, 262, 249), (98, 264, 726, 333), (98, 333, 509, 394), (98, 394, 654, 452), (98, 471, 476, 584), (332, 616, 560, 648)],
        button=(99, 600, 329, 662), panel=(1446, 232, 1650, 601), pause=(1551, 646),
    ),
    4: dict(
        texts=[(98, 221, 239, 246), (98, 261, 444, 335), (98, 335, 696, 411), (98, 431, 484, 579), (336, 621, 582, 652)],
        button=(100, 603, 334, 667), panel=(1448, 234, 1648, 594), pause=(1550, 640),
    ),
    5: dict(
        texts=[(98, 208, 320, 234), (98, 248, 799, 315), (98, 315, 774, 383), (98, 396, 496, 470), (98, 481, 552, 569), (338, 598, 582, 632)],
        button=(102, 583, 336, 646), panel=(1448, 233, 1646, 584), pause=(1548, 623),
    ),
}
NAV = (84, 10, 1600, 90)


def bright_mask(img: np.ndarray, rect, thr=24, dil=5, ksize=45) -> np.ndarray:
    """Pixels bem mais claros que a mediana local (texto, ícones, contornos)."""
    x0, y0, x1, y1 = rect
    pad = ksize
    X0, Y0 = max(0, x0 - pad), max(0, y0 - pad)
    X1, Y1 = min(img.shape[1], x1 + pad), min(img.shape[0], y1 + pad)
    roi = img[Y0:Y1, X0:X1]
    lab = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)
    L = lab[:, :, 0].astype(np.int16)
    bg = cv2.medianBlur(lab[:, :, 0], ksize).astype(np.int16)
    # cor muito saturada e clara (gradiente ciano/rosa dos títulos)
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    colored = (hsv[:, :, 1] > 90) & (hsv[:, :, 2] > 170) & (L - bg > 10)
    m = ((L - bg) > thr) | colored
    m = m.astype(np.uint8) * 255
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dil * 2 + 1, dil * 2 + 1)))
    full = np.zeros(img.shape[:2], np.uint8)
    sub = np.zeros_like(m)
    sub[y0 - Y0 : y1 - Y0, x0 - X0 : x1 - X0] = m[y0 - Y0 : y1 - Y0, x0 - X0 : x1 - X0]
    full[Y0:Y1, X0:X1] = sub
    return full


def rounded_rect_mask(shape, rect, r, grow=0):
    x0, y0, x1, y1 = rect
    x0, y0, x1, y1 = x0 - grow, y0 - grow, x1 + grow, y1 + grow
    m = np.zeros(shape[:2], np.uint8)
    cv2.rectangle(m, (x0 + r, y0), (x1 - r, y1), 255, -1)
    cv2.rectangle(m, (x0, y0 + r), (x1, y1 - r), 255, -1)
    for cx, cy in [(x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)]:
        cv2.circle(m, (cx, cy), r, 255, -1)
    return m


def pyramid_inpaint(img, mask, radius=6):
    """Inpainting em duas escalas: a baixa resolução dá a cor de fundo das áreas grandes,
    a alta resolução reconstrói as bordas finas."""
    small = cv2.resize(img, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
    msmall = cv2.resize(mask, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_NEAREST)
    msmall = cv2.dilate(msmall, np.ones((3, 3), np.uint8))
    base = cv2.inpaint(small, msmall, 5, cv2.INPAINT_TELEA)
    base = cv2.resize(base, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    pre = img.copy()
    pre[mask > 0] = base[mask > 0]
    # erode a máscara para o passo fino aproveitar a base e só costurar as bordas
    fine = cv2.inpaint(pre, cv2.erode(mask, np.ones((3, 3), np.uint8)), radius, cv2.INPAINT_TELEA)
    return fine


def undo_glass(img, rect, r=18):
    """Inverte aproximadamente o vidro escuro do painel: I = (1-a)·B + a·T."""
    x0, y0, x1, y1 = rect
    inner = rounded_rect_mask(img.shape, rect, r, grow=-6) > 0
    outer_ring = (rounded_rect_mask(img.shape, rect, r, grow=14) > 0) & ~(rounded_rect_mask(img.shape, rect, r, grow=4) > 0)
    inner_ring = inner & ~(rounded_rect_mask(img.shape, rect, r, grow=-14) > 0)
    f = img.astype(np.float32)
    O = f[outer_ring].mean(0)
    I = f[inner_ring].mean(0)
    T = np.array([48, 26, 18], np.float32)  # azul-marinho do vidro (BGR)
    a = np.clip((O - I) / np.maximum(O - T, 1), 0.05, 0.8).mean()
    out = f.copy()
    region = rounded_rect_mask(img.shape, rect, r, grow=2) > 0
    out[region] = (f[region] - a * T) / (1 - a)
    return np.clip(out, 0, 255).astype(np.uint8), a


def process(n: int):
    spec = FRAMES[n]
    img = cv2.imread(str(SRC / f"frame-0{n}.png"))

    # 1) painel: desfaz o vidro, depois remove anéis, rótulos, destaque ativo e borda
    img, a = undo_glass(img, spec["panel"])
    pm = bright_mask(img, spec["panel"], thr=14, dil=4, ksize=31)
    border = rounded_rect_mask(img.shape, spec["panel"], 18, grow=4) & ~rounded_rect_mask(img.shape, spec["panel"], 18, grow=-5)
    mask = cv2.bitwise_or(pm, border)
    cx, cy = spec["pause"]
    cv2.circle(mask, (cx, cy), 33, 255, -1)

    # 2) menu
    mask = cv2.bitwise_or(mask, bright_mask(img, NAV, thr=22, dil=5))
    # pílula "Ver metodologia" inteira
    cv2.rectangle(mask, (1390, 20), (1590, 80), 255, -1)

    # 3) bloco de texto + botão
    for rect in spec["texts"]:
        mask = cv2.bitwise_or(mask, bright_mask(img, rect, thr=22, dil=5))
    bx0, by0, bx1, by1 = spec["button"]
    mask = cv2.bitwise_or(mask, rounded_rect_mask(img.shape, (bx0, by0, bx1, by1), (by1 - by0) // 2, grow=4))

    clean = pyramid_inpaint(img, mask)

    # linha ativa do painel costuma deixar um "halo" colorido: suaviza a área do painel
    pr = rounded_rect_mask(img.shape, spec["panel"], 18, grow=6) > 0
    blurred = cv2.GaussianBlur(clean, (0, 0), 6)
    clean[pr] = blurred[pr]

    OUT.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(OUT / f"frame-0{n}.webp"), clean, [cv2.IMWRITE_WEBP_QUALITY, 84])
    if n == 1:  # poster do vídeo e imagem de compartilhamento
        cv2.imwrite(str(OUT / "frame-01.jpg"), clean, [cv2.IMWRITE_JPEG_QUALITY, 82, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])

    # cena de fechamento (frame 1) sem a faixa reconstruída sob o painel
    if n == 1:
        cv2.imwrite(str(OUT / "closing.webp"), clean[:, :1432], [cv2.IMWRITE_WEBP_QUALITY, 84])
    print(f"frame-0{n}: vidro a≈{a:.2f}, máscara {100 * (mask > 0).mean():.1f}%")
    return mask


def discovery():
    """Arte da seção "A grande descoberta" (design/ref-grande-descoberta.png, 1672×941).
    Remove textos, números, rótulos e botão; mantém planetas, órbitas, ícones e feixe."""
    src = ROOT / "design" / "ref-grande-descoberta.png"
    if not src.exists():
        return
    img = cv2.imread(str(src))
    texts = [
        (722, 82, 952, 104),     # eyebrow
        (526, 112, 1158, 224),   # título
        (380, 390, 516, 460),    # 116
        (356, 462, 540, 492),    # 28,71% dos registros
        (1158, 390, 1292, 460),  # 105
        (1132, 462, 1316, 492),  # 25,99% dos registros
        (800, 468, 872, 494),    # juntos,
        (774, 494, 898, 534),    # 54,70%
        (254, 616, 644, 644),    # rótulo esquerdo
        (1086, 616, 1366, 644),  # rótulo direito
        (540, 700, 1132, 808),   # parágrafos
        (744, 846, 930, 874),    # texto do botão
    ]
    mask = np.zeros(img.shape[:2], np.uint8)
    for r in texts:
        mask = cv2.bitwise_or(mask, bright_mask(img, r, thr=16, dil=5, ksize=41))
    # contorno da pílula do botão
    pill = rounded_rect_mask(img.shape, (728, 836, 944, 884), 24, grow=3) & ~rounded_rect_mask(img.shape, (728, 836, 944, 884), 24, grow=-4)
    mask = cv2.bitwise_or(mask, pill)
    clean = pyramid_inpaint(img, mask)
    out = ROOT / "public" / "sections"
    out.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out / "descoberta.webp"), clean, [cv2.IMWRITE_WEBP_QUALITY, 86])
    # texturas dos planetas para o layout empilhado (mobile)
    for name, (cx, cy, r) in {"planeta-ciano": (447, 437, 152), "planeta-violeta": (1225, 437, 152)}.items():
        crop = clean[cy - r : cy + r, cx - r : cx + r]
        cv2.imwrite(str(out / f"{name}.webp"), crop, [cv2.IMWRITE_WEBP_QUALITY, 88])
    print(f"descoberta: máscara {100 * (mask > 0).mean():.1f}%")


if __name__ == "__main__":
    discovery()
    for n in FRAMES:
        process(n)
