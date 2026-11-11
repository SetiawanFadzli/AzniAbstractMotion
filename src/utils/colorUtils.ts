export function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return [0.5, 0.5, 0.5];
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clampR = Math.min(255, Math.max(0, Math.round(r * 255)));
  const clampG = Math.min(255, Math.max(0, Math.round(g * 255)));
  const clampB = Math.min(255, Math.max(0, Math.round(b * 255)));
  return (
    '#' +
    [clampR, clampG, clampB]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

// Convert HSL to Hex
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate an aesthetically harmonized palette with count colors (between 2 and 10)
export function generateHarmoniousPalette(count: number): string[] {
  const clampedCount = Math.min(10, Math.max(2, count));
  const baseHue = Math.floor(Math.random() * 360);
  const mode = Math.random();

  const colors: string[] = [];

  if (mode < 0.35) {
    // Analogous / Monochromatic gradient ramp (Very popular on Adobe Stock)
    const hueSpread = 60 + Math.random() * 50;
    for (let i = 0; i < clampedCount; i++) {
      const step = i / (clampedCount - 1);
      const h = (baseHue + step * hueSpread) % 360;
      const s = 65 + Math.sin(step * Math.PI) * 25;
      const l = 15 + step * 70; // From deep shadow to bright highlight
      colors.push(hslToHex(h, s, l));
    }
  } else if (mode < 0.7) {
    // Complementary / Vibrant duo-split (Cyberpunk / Sunset style)
    const complementHue = (baseHue + 160 + Math.random() * 40) % 360;
    for (let i = 0; i < clampedCount; i++) {
      const step = i / (clampedCount - 1);
      const h = step < 0.5 
        ? (baseHue + step * 40) % 360 
        : (complementHue + (step - 0.5) * 40) % 360;
      const s = 70 + Math.random() * 25;
      const l = 20 + step * 60;
      colors.push(hslToHex(h, s, l));
    }
  } else {
    // Triadic / Rainbow Aura
    for (let i = 0; i < clampedCount; i++) {
      const step = i / clampedCount;
      const h = (baseHue + step * 240) % 360;
      const s = 75 + Math.random() * 20;
      const l = 35 + (i % 2 === 0 ? 35 : 15);
      colors.push(hslToHex(h, s, l));
    }
  }

  return colors;
}
