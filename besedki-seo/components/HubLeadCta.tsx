import { getSite } from '@/lib/content';

export default function HubLeadCta({ note }: { note?: string }) {
  const site = getSite();
  const tel = site.phone.replace(/[^\d+]/g, '');

  return (
    <div className="mb-8 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-heading text-lg">Расчёт за 15 минут</p>
        <p className="mt-1 text-sm text-text-muted">
          {note ?? 'Размер, серия и смета по участку в Москве и МО. Без обязательства заказать.'}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a href="#raschet" className="btn-primary">
          Оставить заявку
        </a>
        <a href={`tel:${tel}`} className="btn-secondary">
          {site.phone}
        </a>
      </div>
    </div>
  );
}
