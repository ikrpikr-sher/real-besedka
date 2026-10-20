import NavLink from '@/components/NavLink';

type Material = {
  slug: string;
  title: string;
  summary: string;
  coverImage?: string;
};

export default function MaterialCard({ material }: { material: Material }) {
  return (
    <NavLink href={`/materialy/${material.slug}`} className="card block overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className="aspect-[16/9] overflow-hidden bg-border">
        {material.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={material.coverImage} alt={material.title} className="h-full w-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="p-4">
        <h2 className="font-heading text-lg">{material.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-text-muted">{material.summary}</p>
      </div>
    </NavLink>
  );
}
