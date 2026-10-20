export const UTM_STORAGE_KEY = 'rb_utm';
export const METRIKA_COUNTER_ID = 111500128;

export const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type StoredAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPage?: string;
  referrer?: string;
};

export type LeadAttribution = StoredAttribution;

function parseUtmFromSearch(search: string): Partial<StoredAttribution> {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const next: Partial<StoredAttribution> = {};

  const source = params.get('utm_source')?.trim();
  const medium = params.get('utm_medium')?.trim();
  const campaign = params.get('utm_campaign')?.trim();
  const content = params.get('utm_content')?.trim();
  const term = params.get('utm_term')?.trim();

  if (source) next.utmSource = source;
  if (medium) next.utmMedium = medium;
  if (campaign) next.utmCampaign = campaign;
  if (content) next.utmContent = content;
  if (term) next.utmTerm = term;

  return next;
}

export function readAttribution(): StoredAttribution {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAttribution) : {};
  } catch {
    return {};
  }
}

export function persistAttribution(search: string): void {
  if (typeof window === 'undefined') return;

  const fromUrl = parseUtmFromSearch(search);
  const hasUtm = Object.keys(fromUrl).length > 0;
  const externalReferrer =
    document.referrer && !document.referrer.includes(window.location.host) ? document.referrer : undefined;

  if (!hasUtm && !externalReferrer) return;

  const existing = readAttribution();
  const next: StoredAttribution = { ...existing, ...fromUrl };

  if (!existing.landingPage) {
    next.landingPage = window.location.pathname + window.location.search;
  }
  if (externalReferrer && !existing.referrer) {
    next.referrer = externalReferrer;
  }

  sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(next));
}

export function trackMetrikaGoal(goal: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  if (typeof window.ym === 'function') {
    window.ym(METRIKA_COUNTER_ID, 'reachGoal', goal, params);
  }
  if (typeof window.gtag === 'function') {
    window.gtag('event', goal, params);
  }
}

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}
