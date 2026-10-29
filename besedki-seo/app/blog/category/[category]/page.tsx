import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleCard from '@/components/ArticleCard';
import JsonLd from '@/components/JsonLd';
import { blogCategoryLabel, getAllCategories, getPostsByCategory } from '@/lib/blog';
import { getSite } from '@/lib/content';
import { blogCategoryPath } from '@/lib/urlPath';

type Props = { params: { category: string } };

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category }));
}

const CATEGORY_SEO: Record<string, { title: string; description: string; h1: string }> = {
  'kak-vybrat': {
    title: 'Как выбрать металлическую беседку — гиды Реал Беседки',
    description:
      'Как выбрать беседку из металла: размер, каркас 80×80, остекление, мангал. Практика производства и монтажа в Москве и МО.',
    h1: 'Как выбрать металлическую беседку',
  },
  sravneniya: {
    title: 'Сравнения беседок и материалов — Реал Беседки',
    description:
      'Сравнения: металл и дерево, болты и сварка, открытая и закрытая беседка. Честно по узлам и покрытию — ООО «Пулман».',
    h1: 'Сравнения: что взять на участок',
  },
  'proekty-i-idei': {
    title: 'Проекты и идеи беседок на участок — Реал Беседки',
    description:
      'Идеи посадки беседки на участке Москва/МО: лофт, остекление, мангал. Каркас 80×80, пол фанера в базе.',
    h1: 'Проекты и идеи для участка',
  },
  'montazh-i-uhod': {
    title: 'Монтаж и уход за металлической беседкой — Реал Беседки',
    description:
      'Монтаж на сваи или фундамент, порошок, шторы, дымоход. Как обслуживать беседку 80×80 после сезона.',
    h1: 'Монтаж и уход',
  },
  stili: {
    title: 'Стили металлических беседок: лофт и дизайн — Реал Беседки',
    description:
      'Стили беседок: лофт, лазерные панели, графит RAL 7016. Как подобрать вид под фасад дома.',
    h1: 'Стили металлических беседок',
  },
  razmery: {
    title: 'Размеры металлических беседок — от 2×2 до 6×6 | Реал Беседки',
    description:
      'Какой размер беседки из металла выбрать: 2×2, 3×3, 3×4, 4×4 и больше. Каркас 80×80, посадка на участок в Москве и МО.',
    h1: 'Размеры металлических беседок',
  },
  'mangal-i-ogon': {
    title: 'Мангал и серия «Огонь» — статьи Реал Беседки',
    description:
      'Мангал в металлической беседке: дымоход, серия «Огонь», жаровня и печь под казан. Производство и монтаж в Москве и МО.',
    h1: 'Мангал и серия «Огонь»',
  },
  'katalog-serii': {
    title: 'Серии беседок «Панорама» и «Огонь» — Реал Беседки',
    description:
      'Чем серии каталога отличаются: остекление «Панорама», мангал «Огонь», открытый каркас 80×80. Москва и МО.',
    h1: 'Серии каталога беседок',
  },
  konstrukciya: {
    title: 'Конструкция беседки: каркас 80×80×3 мм — Реал Беседки',
    description:
      'Несущий профиль металлической беседки 80×80 со стенкой 3 мм: чем он отличается от более тонкого каркаса. Завод ООО «Пулман».',
    h1: 'Конструкция каркаса 80×80',
  },
  'zakaz-i-montazh': {
    title: 'Заказ и монтаж металлической беседки под ключ — Реал Беседки',
    description:
      'Что входит в беседку под ключ: производство, доставка и монтаж на участке в Москве и Московской области.',
    h1: 'Заказ и монтаж под ключ',
  },
  'zakaz-i-dogovor': {
    title: 'Замер, договор и доставка беседки — Реал Беседки',
    description:
      'Замер участка, что не входит в базу под ключ, доставка металлической беседки по Москве и МО.',
    h1: 'Замер, договор и доставка',
  },
};

function isLiveBlogCategory(slug: string): boolean {
  return Boolean(CATEGORY_SEO[slug]) || getAllCategories().includes(slug);
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isLiveBlogCategory(params.category)) notFound();
  const categoryPath = blogCategoryPath(params.category);
  const label = blogCategoryLabel(params.category);
  const seo = CATEGORY_SEO[params.category];
  return {
    title: seo?.title || `${label} — блог Реал Беседки`,
    description:
      seo?.description ||
      `Статьи Реал Беседки в рубрике «${label}»: выбор, монтаж и стили металлических беседок для Москвы и МО.`,
    alternates: { canonical: categoryPath },
  };
}

export default function CategoryPage({ params }: Props) {
  if (!isLiveBlogCategory(params.category)) notFound();
  const posts = getPostsByCategory(params.category);
  const label = blogCategoryLabel(params.category);
  const seo = CATEGORY_SEO[params.category];
  const h1 = seo?.h1 || label;
  const site = getSite();
  const categoryPath = blogCategoryPath(params.category);
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Блог', item: `${site.siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: label, item: `${site.siteUrl}${categoryPath}` },
    ],
  };
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: h1,
    description: seo?.description || `Статьи Реал Беседки в рубрике «${label}».`,
    url: `${site.siteUrl}${categoryPath}`,
  };
  return (
    <Container className="page-section">
      <JsonLd data={[collectionLd, breadcrumbLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Блог', href: '/blog' },
          { label: label, href: categoryPath },
        ]}
      />
      <h1 className="page-title mb-6">{h1}</h1>
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
