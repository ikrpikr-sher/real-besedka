export const FRAME_COLOR_HEX: Record<string, string> = {
  korichnevyy: '#6B4423',
  chernyy: '#1C1C1C',
  belyy: '#E8E8E8',
  grafit: '#383E42',
  'na-vybor': '#383E42',
};

export function hexToLinearRgb(hex: string): [number, number, number, number] {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return [r, g, b, 1];
}
