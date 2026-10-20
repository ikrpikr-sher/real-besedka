/** Encode one path segment for URLs with кириллицей, пробелами и спецсимволами. */
export function encodePathSegment(segment: string): string {
  return encodeURIComponent(segment);
}

export function blogTagPath(tag: string): string {
  return `/blog/tag/${encodePathSegment(tag)}`;
}

export function blogCategoryPath(category: string): string {
  return `/blog/category/${encodePathSegment(category)}`;
}

export function absoluteUrl(base: string, pathname: string): string {
  return `${base.replace(/\/$/, '')}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}
