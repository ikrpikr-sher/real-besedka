'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetchJson';

type Lead = { status?: string };

export default function AdminLeadsSummary() {
  const [counts, setCounts] = useState<{ newLeads: number; total: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchJson<{ leads: Lead[] }>('/api/leads', { credentials: 'same-origin' })
      .then(({ ok, data }) => {
        if (!ok) throw new Error('unauthorized');
        const leads = data.leads || [];
        setCounts({
          newLeads: leads.filter((l) => (l.status || 'new') === 'new').length,
          total: leads.length,
        });
      })
      .catch(() => setError(true));
  }, []);

  return (
    <Link href="/admin/leads" className="card block hover:shadow-md">
      <p className="text-sm text-text-muted">Новые заявки</p>
      <p className="mt-1 font-heading text-3xl">
        {error ? (
          <span className="text-base text-red-600">Ошибка загрузки</span>
        ) : counts === null ? (
          <span className="text-base text-text-muted">…</span>
        ) : (
          <>
            {counts.newLeads}
            <span className="text-base text-text-muted"> / {counts.total}</span>
          </>
        )}
      </p>
    </Link>
  );
}
