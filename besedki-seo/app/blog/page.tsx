import type { Metadata } from 'next';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleCard from '@/components/ArticleCard';
import { getAllPosts } from '@/lib/blog';
import { getSeo } from '@/lib/seo';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const PER_PAGE = 24;

export function generateMetadata(): Metadata {
  const seo = getSeo('/blog', {
    title: 'Блог о беседках: гайды, сравнения, проекты',
    description:
      'Гайды по выбору беседки, сравнения материалов, нормы и правила монтажа, идеи и проекты — блог о дизайнерских беседках.',
  });
  return { title: seo.title, description: seo.description, alternates: { canonical: '/blog' } };
}

type Props = { searchParams?: { page?: string } };

export default function BlogIndexPage({ searchParams }: Props) {
  const posts = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const page = Math.min(totalPages, Math.max(1, Number(searchParams?.page || 1) || 1));
  const slice = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Container className="page-section">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Блог', href: '/blog' }]} />
      <h1 className="page-title mb-6">Блог</h1>
      <p className="mb-6 text-sm text-text-muted">
        Те же разборы завода — в канале{' '}
        <a
          href="https://dzen.ru/realbesedki"
          className="text-accent underline-offset-2 hover:underline"
          rel="noopener noreferrer"
        >
          Дзен · Real Besedki
        </a>
        . Всего материалов: {posts.length}.
      </p>
      {slice.length === 0 ? (
        <p className="text-text-muted">Скоро здесь появятся статьи.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {slice.map((post) => (
            <ArticleCard key={post.slug} article={post} />
          ))}
        </div>
      )}
      {totalPages > 1 ? (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm" aria-label="Страницы блога">
          {page > 1 ? (
            <Link className="text-accent underline-offset-2 hover:underline" href={page === 2 ? '/blog' : `/blog?page=${page - 1}`}>
              ← Назад
            </Link>
          ) : null}
          <span className="text-text-muted">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link className="text-accent underline-offset-2 hover:underline" href={`/blog?page=${page + 1}`}>
              Вперёд →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </Container>
  );
}
