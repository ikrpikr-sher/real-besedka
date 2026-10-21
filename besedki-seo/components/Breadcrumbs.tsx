import NavLink from '@/components/NavLink';
import JsonLd from '@/components/JsonLd';
import { getSite } from '@/lib/content';

export type Crumb = { label: string; href: string };

function crumbUrl(siteUrl: string, href: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  const base = siteUrl.replace(/\/$/, '');
  if (href === '/' || href === '') return base;
  return `${base}${href.startsWith('/') ? href : `/${href}`}`;
}

export default function Breadcrumbs({
  items,
  schema = true,
}: {
  items: Crumb[];
  /** false — на странице уже есть свой BreadcrumbList (каталог, услуги, статья). */
  schema?: boolean;
}) {
  const siteUrl = schema ? getSite().siteUrl : '';
  const breadcrumbLd = schema
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.label,
          item: crumbUrl(siteUrl, item.href),
        })),
      }
    : null;

  return (
    <>
      {breadcrumbLd ? <JsonLd data={breadcrumbLd} /> : null}
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
    </>
  );
}
