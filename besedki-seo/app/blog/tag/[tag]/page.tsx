import type { Metadata } from 'next';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleCard from '@/components/ArticleCard';
import { blogTagLabel, getPostsByTag } from '@/lib/blog';
import { blogTagPath } from '@/lib/urlPath';

type Props = { params: { tag: string } };

/** Dynamic: mass blog import would explode SSG tag pages. */
export const dynamic = 'force-dynamic';

export function generateMetadata({ params }: Props): Metadata {
  const tagPath = blogTagPath(params.tag);
  const label = blogTagLabel(params.tag);
  return {
    title: `${label} — блог Реал Беседки`,
    description: `Статьи Реал Беседки по теме «${label}».`,
    alternates: { canonical: tagPath },
    robots: { index: false, follow: true },
  };
}

export default function TagPage({ params }: Props) {
  const posts = getPostsByTag(params.tag);
  return (
    <Container className="page-section">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Блог', href: '/blog' },
          { label: blogTagLabel(params.tag), href: blogTagPath(params.tag) },
        ]}
      />
      <h1 className="page-title mb-6">{blogTagLabel(params.tag)}</h1>
      {posts.length === 0 ? (
        <p className="text-text-muted">Скоро здесь появятся статьи.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post.slug} article={post} />
          ))}
        </div>
      )}
    </Container>
  );
}
