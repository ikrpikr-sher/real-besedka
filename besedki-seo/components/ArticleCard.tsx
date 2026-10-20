import NavLink from '@/components/NavLink';
import { blogCategoryLabel } from '@/lib/blog';

type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  author: string;
  coverImage?: string;
};

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <NavLink href={`/blog/${article.slug}`} className="card block overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className="aspect-[16/9] overflow-hidden bg-border">
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-accent">{blogCategoryLabel(article.category)}</p>
        <h3 className="mt-1 font-heading text-lg">{article.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">{article.description}</p>
        <p className="mt-2 text-xs text-text-muted">
          {article.author} · {new Date(article.date).toLocaleDateString('ru-RU')}
        </p>
      </div>
    </NavLink>
  );
}
