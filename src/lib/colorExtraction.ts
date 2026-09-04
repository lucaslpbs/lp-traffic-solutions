export interface ExtractedPalette {
  primaria: string;
  secundaria: string;
}

/** Converte um hex (#fff ou #ffffff) em [r,g,b] 0-255. */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean.padEnd(6, '0').slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

/** Cor hex como rgba() CSS com a opacidade dada — usado pros cartões "vidro". */
export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Luminância relativa (0-1) de uma cor hex — usada pra decidir texto claro ou escuro em cima dela. */
export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Se um fundo dessa cor precisa de texto escuro em cima (fundo claro). */
export function isLightColor(hex: string): boolean {
  return getRelativeLuminance(hex) > 0.6;
}

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

/** Distancia simples entre duas cores no espaco RGB. */
const colorDistance = (a: [number, number, number], b: [number, number, number]) =>
  Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

/**
 * Extrai duas cores dominantes de uma imagem (ex: logo do cliente), pra usar
 * como sugestao inicial no tema da pagina de links. Amostra pixels via
 * canvas, agrupa em baldes grosseiros de cor e ignora tons quase-brancos ou
 * quase-pretos (normalmente fundo, nao a marca em si).
 */
export async function extractPaletteFromImage(file: File): Promise<ExtractedPalette> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponivel');
    ctx.drawImage(img, 0, 0, size, size);

    const { data } = ctx.getImageData(0, 0, size, size);
    const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 128) continue;

      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      if (luminance > 235 || luminance < 20) continue;

      const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`;
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.count += 1;
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
      } else {
        buckets.set(key, { count: 1, r, g, b });
      }
    }

    const sorted = [...buckets.values()]
      .map((b) => ({ count: b.count, rgb: [b.r / b.count, b.g / b.count, b.b / b.count] as [number, number, number] }))
      .sort((a, b) => b.count - a.count);

    if (sorted.length === 0) {
      return { primaria: '#6366f1', secundaria: '#8b5cf6' };
    }

    const primary = sorted[0].rgb;
    const secondary =
      sorted.find((c) => colorDistance(c.rgb, primary) > 60)?.rgb ??
      sorted[Math.min(1, sorted.length - 1)].rgb;

    return {
      primaria: rgbToHex(...primary.map(Math.round) as [number, number, number]),
      secundaria: rgbToHex(...secondary.map(Math.round) as [number, number, number]),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
