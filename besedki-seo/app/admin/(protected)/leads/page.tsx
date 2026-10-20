'use client';

import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetchJson';

type Lead = {
  id: string;
  name: string;
  phone: string;
  comment?: string;
  context?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPage?: string;
  referrer?: string;
  status: 'new' | 'in_progress' | 'done';
  createdAt: string;
};

function formatUtm(lead: Lead): string {
  const parts = [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean);
  if (parts.length === 0) return '—';
  let line = parts.join(' / ');
  if (lead.utmTerm) line += ` · ${lead.utmTerm}`;
  return line;
}

const STATUS_LABEL: Record<Lead['status'], string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Готово',
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const { ok, data } = await fetchJson<{ leads: Lead[] }>('/api/leads', { credentials: 'same-origin' });
      if (!ok) {
        setError('Не удалось загрузить заявки');
        return;
      }
      setLeads(data.leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить заявки');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: Lead['status']) {
    setLeads((prev) => prev?.map((l) => (l.id === id ? { ...l, status } : l)) || null);
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }

  async function remove(id: string) {
    if (!confirm('Удалить заявку?')) return;
    setLeads((prev) => prev?.filter((l) => l.id !== id) || null);
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl">Заявки</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!leads ? (
        <p className="text-text-muted">Загрузка…</p>
      ) : leads.length === 0 ? (
        <p className="text-text-muted">Пока нет заявок.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="py-2 pr-4">Дата</th>
                <th className="py-2 pr-4">Имя</th>
                <th className="py-2 pr-4">Телефон</th>
                <th className="py-2 pr-4">Контекст</th>
                <th className="py-2 pr-4">UTM</th>
                <th className="py-2 pr-4">Комментарий</th>
                <th className="py-2 pr-4">Статус</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/60 align-top">
                  <td className="py-2 pr-4 whitespace-nowrap text-text-muted">
                    {new Date(lead.createdAt).toLocaleString('ru-RU')}
                  </td>
                  <td className="py-2 pr-4">{lead.name}</td>
                  <td className="py-2 pr-4">
                    <a href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`} className="hover:underline">
                      {lead.phone}
                    </a>
                  </td>
                  <td className="py-2 pr-4 text-text-muted">{lead.context || '—'}</td>
                  <td className="py-2 pr-4 max-w-[180px] text-text-muted" title={lead.landingPage || lead.referrer || undefined}>
                    {formatUtm(lead)}
                  </td>
                  <td className="py-2 pr-4 max-w-[240px] text-text-muted">{lead.comment || '—'}</td>
                  <td className="py-2 pr-4">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value as Lead['status'])}
                      className="rounded-DEFAULT border border-border px-2 py-1"
                    >
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-4">
                    <button type="button" onClick={() => remove(lead.id)} className="text-xs text-red-600 hover:underline">
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
