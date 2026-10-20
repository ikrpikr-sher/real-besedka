import type { KacheliPatternGroup } from '@/lib/kacheliCatalog';
import { getKacheliPatternImage } from '@/lib/kacheliCatalog';
import { getCatalogItemUrl } from '@/lib/content';
import NavLink from '@/components/NavLink';

export default function KacheliPatternCard({ group }: { group: KacheliPatternGroup }) {
  const previewItem = group.twoSeater ?? group.threeSeater;
  const image = getKacheliPatternImage(previewItem);
  const title = `Качели «Графит · ${group.pattern}»`;

  return (
    <article className="card flex h-full flex-col">
      <div className="mb-3 aspect-[4/3] overflow-hidden rounded-DEFAULT bg-border">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`Лазерная панель — ${group.pattern}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>
      <h3 className="font-heading text-lg">{title}</h3>
      <p className="mt-1 text-sm text-text-muted">Узор на боковых панелях · каркас 80×80, RAL 7016</p>
      <div className="mt-4 flex flex-col gap-2">
        {group.twoSeater ? (
          <NavLink
            href={getCatalogItemUrl(group.twoSeater)}
            className="flex items-center justify-between rounded-DEFAULT border border-border px-3 py-2 text-sm transition-colors hover:border-accent hover:bg-surface"
          >
            <span>
              <span className="font-medium">2 места</span>
              <span className="text-text-muted"> · {group.twoSeater.size}</span>
            </span>
            <span className="font-semibold text-accent">
              от {group.twoSeater.priceFrom.toLocaleString('ru-RU')} ₽
            </span>
          </NavLink>
        ) : null}
        {group.threeSeater ? (
          <NavLink
            href={getCatalogItemUrl(group.threeSeater)}
            className="flex items-center justify-between rounded-DEFAULT border border-border px-3 py-2 text-sm transition-colors hover:border-accent hover:bg-surface"
          >
            <span>
              <span className="font-medium">3 места</span>
              <span className="text-text-muted"> · {group.threeSeater.size}</span>
            </span>
            <span className="font-semibold text-accent">
              от {group.threeSeater.priceFrom.toLocaleString('ru-RU')} ₽
            </span>
          </NavLink>
        ) : null}
      </div>
    </article>
  );
}
