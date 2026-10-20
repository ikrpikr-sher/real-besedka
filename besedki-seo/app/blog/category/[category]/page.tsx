import type { Metadata } from 'next';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleCard from '@/components/ArticleCard';
import { blogCategoryLabel, getAllCategories, getPostsByCategory } from '@/lib/blog';
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
};

export function generateMetadata({ params }: Props): Metadata {
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
  const posts = getPostsByCategory(params.category);
  const label = blogCategoryLabel(params.category);
  const seo = CATEGORY_SEO[params.category];
  const h1 = seo?.h1 || label;
  return (
    <Container className="page-section">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Блог', href: '/blog' },
          { label: label, href: blogCategoryPath(params.category) },
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
