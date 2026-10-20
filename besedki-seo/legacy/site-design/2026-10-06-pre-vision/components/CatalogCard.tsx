import type { CatalogItem } from '@/lib/content';
import { getCatalogItemUrl } from '@/lib/content';
import NavLink from '@/components/NavLink';
import { pickCardImage, withCardImageCacheBust } from '@/lib/catalogImages';
import {
  CATALOG_FRAME_FINISH,
  CATALOG_LEAD_TIME,
  CATALOG_MOUNTING,
  CATALOG_SERVICE_LIFE,
} from '@/lib/catalogSpecs';

type CatalogCardProps = {
  item: CatalogItem;
  /** Короткая карточка для плотных каталогов — только размер и цена. */
  compact?: boolean;
  /** Первые карточки выше сгиба — без lazy, чтобы LCP не ждал. */
  priority?: boolean;
};

export default function CatalogCard({ item, compact = false, priority = false }: CatalogCardProps) {
  const rawImage = pickCardImage(item.images ?? []) ?? item.images?.[0];
  const image = rawImage ? withCardImageCacheBust(rawImage) : undefined;
  const href = getCatalogItemUrl(item);

  return (
    <NavLink href={href} className="card block transition-shadow hover:shadow-md">
      <div className="mb-3 aspect-[4/3] overflow-hidden rounded-DEFAULT bg-border">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={item.title}
            className="h-full w-full object-cover"
            width={640}
            height={480}
            decoding="async"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'low'}
          />
        ) : null}
      </div>
      <h3 className="line-clamp-2 font-heading text-lg leading-snug">{item.title}</h3>
      {compact ? (
        <>
          <p className="mt-2 text-sm text-text-muted">{item.size}</p>
          <p className="mt-2 font-semibold text-accent">от {item.priceFrom.toLocaleString('ru-RU')} ₽</p>
        </>
      ) : (
        <>
          {item.tagline ? <p className="mt-1 text-sm text-text-muted">{item.tagline}</p> : null}
          <p className="mt-1 text-sm text-text-muted">
            {item.material} · {item.size}
          </p>
          <p className="mt-1 text-sm text-text-muted">Монтаж: {CATALOG_MOUNTING}</p>
          <p className="mt-1 text-sm text-text-muted">{CATALOG_FRAME_FINISH}</p>
          <p className="mt-1 text-sm text-text-muted">
            Срок изготовления: {CATALOG_LEAD_TIME} · Срок службы: {CATALOG_SERVICE_LIFE}
          </p>
          <p className="mt-2 font-semibold text-accent">от {item.priceFrom.toLocaleString('ru-RU')} ₽</p>
        </>
      )}
    </NavLink>
  );
}
