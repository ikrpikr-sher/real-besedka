/** URL миниатюры карточки (`-card.webp`) без обращения к диску — для клиента. */

export function catalogCardThumbUrl(src: string): string {
  const [pathPart, query] = src.split('?');
  if (!pathPart || pathPart.includes('-card.')) return src;
  const ext = pathPart.match(/\.[^.]+$/)?.[0];
  if (!ext) return src;
  const stem = pathPart.slice(0, -ext.length);
  const thumb = `${stem}-card.webp`;
  return query ? `${thumb}?${query}` : thumb;
}
