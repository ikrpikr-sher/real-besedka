import type { CatalogItem } from '@/lib/content';
import { getCatalogItemUrl } from '@/lib/content';
import NavLink from '@/components/NavLink';
import { pickCardImage, withCardImageCacheBust } from '@/lib/catalogImages';

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
    <NavLink
      href={href}
      className="group block overflow-hidden rounded-DEFAULT bg-surface shadow-sm ring-1 ring-border transition hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-border">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            width={640}
            height={480}
            decoding="async"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'low'}
          />
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-heading text-lg leading-snug">{item.title}</h3>
        {compact ? (
          <>
            <p className="mt-2 text-sm text-text-muted">{item.size}</p>
            <p className="mt-3 font-heading text-lg text-accent">от {item.priceFrom.toLocaleString('ru-RU')} ₽</p>
          </>
        ) : (
          <>
            {item.tagline ? <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">{item.tagline}</p> : null}
            <p className="mt-1.5 text-sm text-text-muted">{item.size}</p>
            <p className="mt-3 font-heading text-lg text-accent">от {item.priceFrom.toLocaleString('ru-RU')} ₽</p>
          </>
        )}
      </div>
    </NavLink>
  );
}
