import NavLink from '@/components/NavLink';

export type Crumb = { label: string; href: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-4 text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>/</span>}
            {i === items.length - 1 ? (
              <span className="line-clamp-2 text-text sm:line-clamp-none">{item.label}</span>
            ) : (
              <NavLink href={item.href} className="hover:text-accent">
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
