export type FetchJsonResult<T> = {
  ok: boolean;
  status: number;
  data: T;
};

function errorFromStatus(status: number, snippet: string): string {
  if (status === 413) {
    return 'Файл слишком большой для загрузки через браузер. Для видео — до 500 МБ, для фото — до 15 МБ. Можно вставить ссылку Rutube/YouTube/VK.';
  }
  if (status === 401) return 'Сессия истекла — войдите в админку снова.';
  if (status === 502 || status === 504) return 'Сервер временно недоступен. Попробуйте ещё раз.';
  if (snippet) return `Ошибка сервера (${status}): ${snippet}`;
  return `Ошибка сервера (${status}).`;
}

function plainTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

/** Безопасный fetch + JSON: не падает на HTML-страницах ошибок nginx/Next.js. */
export async function fetchJson<T extends Record<string, unknown> = Record<string, unknown>>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<FetchJsonResult<T>> {
  const res = await fetch(input, init);
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(errorFromStatus(res.status, plainTextFromHtml(text)));
  }

  const data = (await res.json()) as T;
  return { ok: res.ok, status: res.status, data };
}
