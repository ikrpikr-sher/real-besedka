import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import VideoEmbed from '@/components/VideoEmbed';
import Video from '@/components/mdx/Video';
import { blogCategoryLabel, getPostBySlug } from '@/lib/blog';
import { getPostVideos } from '@/lib/postVideos';
import { getSite } from '@/lib/content';

type Props = { params: { slug: string } };

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }: Props): Metadata {
  try {
    const post = getPostBySlug(params.slug);
    return {
      title: post.title,
      description: post.description.slice(0, 250),
      alternates: { canonical: `/blog/${post.slug}` },
    };
  } catch {
    return {};
  }
}

export default function ArticlePage({ params }: Props) {
  let post;
  try {
    post = getPostBySlug(params.slug);
  } catch {
    notFound();
  }
  if (!post) notFound();

  const videos = getPostVideos(post);
  const site = getSite();
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { '@type': 'Person', name: post.author, jobTitle: post.authorRole },
    publisher: { '@type': 'Organization', name: site.legalName },
    mainEntityOfPage: `${site.siteUrl}/blog/${post.slug}`,
  };
  const faqLd = post.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Блог', item: `${site.siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${site.siteUrl}/blog/${post.slug}` },
    ],
  };

  return (
    <Container className="page-section">
      <JsonLd data={[articleLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Блог', href: '/blog' },
          { label: post.title, href: `/blog/${post.slug}` },
        ]}
      />
      <article className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-wide text-accent">{blogCategoryLabel(post.category)}</p>
        <h1 className="mt-1 font-heading text-2xl sm:text-3xl">{post.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-text-muted">
          <div className="h-8 w-8 rounded-full bg-border" aria-hidden />
          <span>
            {post.author}
            {post.authorRole ? `, ${post.authorRole}` : ''}
          </span>
          <span>·</span>
          <span>Обновлено: {new Date(post.updated || post.date).toLocaleDateString('ru-RU')}</span>
        </div>
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="mt-6 w-full max-h-[min(28rem,52vw)] rounded-lg object-cover"
            width={1200}
            height={675}
          />
        ) : null}
        {videos.length > 0 ? (
          <div className="mt-6 space-y-4">
            {videos.map((url, index) => (
              <VideoEmbed
                key={`${url}-${index}`}
                url={url}
                title={`${post.title} — видео ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
        <div className="prose prose-neutral mt-6 max-w-none">
          <MDXRemote source={post.content} components={{ Video }} />
        </div>
        <FAQ items={post.faq || []} />
      </article>
    </Container>
  );
}
