/** Общая разметка водяного знака: 4 надписи по диагонали, opacity 40%. */

export const WATERMARK_FILL_OPACITY = 0.4;
export const WATERMARK_STROKE_OPACITY = 0.22;
export const WATERMARK_COUNT = 4;

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * SVG на весь кадр: 4 надписи по диагонали от верхнего левого к нижнему правому краю.
 */
export function buildDiagonalWatermarkSvg(label, width, height) {
  const fontSize = Math.max(14, Math.round(Math.min(width, height) / 24));
  const marginX = Math.round(width * 0.06);
  const marginY = Math.round(height * 0.07);

  const xStart = marginX;
  const yStart = marginY + fontSize * 0.5;
  const xEnd = width - marginX;
  const yEnd = height - marginY;

  const dx = xEnd - xStart;
  const dy = yEnd - yStart;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  const texts = [];
  for (let i = 0; i < WATERMARK_COUNT; i++) {
    const t = (i + 1) / (WATERMARK_COUNT + 1);
    const x = xStart + dx * t;
    const y = yStart + dy * t;
    texts.push(
      `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${angle.toFixed(2)}, ${x.toFixed(1)}, ${y.toFixed(1)})" ` +
        `text-anchor="middle" dominant-baseline="middle" ` +
        `font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fontSize}" ` +
        `fill="#ffffff" fill-opacity="${WATERMARK_FILL_OPACITY}" ` +
        `stroke="#000000" stroke-width="1.1" stroke-opacity="${WATERMARK_STROKE_OPACITY}" paint-order="stroke">` +
        `${escapeXml(label)}</text>`,
    );
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${texts.join('\n')}
</svg>`;
  return Buffer.from(svg);
}
