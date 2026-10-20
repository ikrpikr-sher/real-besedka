import NavLink from '@/components/NavLink';

type Service = {
  slug: string;
  title: string;
  summary: string;
  coverImage?: string;
};

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <NavLink href={`/uslugi/${service.slug}`} className="card block overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className="aspect-[16/9] overflow-hidden bg-border">
        {service.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={service.coverImage} alt={service.title} className="h-full w-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="p-4">
        <h2 className="font-heading text-lg">{service.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-text-muted">{service.summary}</p>
      </div>
    </NavLink>
  );
}
