'use client';

import { useState } from 'react';
import { fetchJson } from '@/lib/fetchJson';
import { readAttribution, trackMetrikaGoal } from '@/lib/marketing';

export default function LeadForm({ context, compact }: { context?: string; compact?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const { ok, data: result } = await fetchJson<{ ok?: boolean; error?: string }>('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          phone: data.get('phone'),
          comment: data.get('comment'),
          context: data.get('context') || context,
          consent: data.get('consent') === 'on',
          ...readAttribution(),
        }),
      });
      if (!ok || !result.ok) {
        setErrorMessage(result.error || 'Не удалось отправить заявку. Попробуйте ещё раз.');
        setStatus('error');
        return;
      }
      trackMetrikaGoal('lead_submit', {
        context: (data.get('context') as string) || context,
      });
      setStatus('sent');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ошибка сети. Проверьте соединение и попробуйте ещё раз.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card" role="status">
        <p className="font-heading text-lg">Спасибо! Заявка отправлена.</p>
        <p className="mt-1 text-sm text-text-muted">Свяжемся с вами в течение рабочего дня.</p>
      </div>
    );
  }

  return (
    <form
      id="site-lead-form"
      onSubmit={handleSubmit}
      className={compact ? 'space-y-3 p-5 sm:p-7' : 'card space-y-3'}
      aria-label="Форма заявки"
    >
      {compact ? (
        <div>
          <p className="font-heading text-xl leading-snug">Расчёт за 15 минут</p>
          <p className="mt-1 text-sm text-text-muted">Перезвоним в рабочий день. Без рассылки.</p>
        </div>
      ) : null}
      {context ? <input type="hidden" name="context" value={context} /> : null}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-text">
          Имя
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className="input"
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm text-text">
          Телефон
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          className="input"
        />
      </div>
      <div>
        <label htmlFor="comment" className="mb-1 block text-sm text-text">
          Комментарий
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          className="input"
        />
      </div>
      <div className="flex items-start gap-2">
        <input id="consent" name="consent" type="checkbox" required className="mt-1" />
        <label htmlFor="consent" className="text-xs text-text-muted">
          Согласен на обработку персональных данных в соответствии с{' '}
          <a href="/politika-konfidencialnosti" className="underline hover:text-accent">
            политикой конфиденциальности
          </a>
          .
        </label>
      </div>
      {status === 'error' && errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full disabled:opacity-60">
        {status === 'sending' ? 'Отправляем…' : 'Оставить заявку'}
      </button>
    </form>
  );
}
