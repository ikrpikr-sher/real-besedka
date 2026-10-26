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
  'katalog-serii': {
    title: 'Серии беседок в каталоге — блог Реал Беседки',
    description:
      'Серии металлических беседок: лофт, Панорама, Графит. Чем линейки отличаются по каркасу 80×80 и комплектации.',
    h1: 'Серии беседок в каталоге',
  },
  konstrukciya: {
    title: 'Конструкция металлической беседки — блог Реал Беседки',
    description:
      'Как устроена беседка: каркас 80×80, пол из фанеры в базе, кровля, панели ЧПУ. Узлы производства ООО «Пулман».',
    h1: 'Конструкция металлической беседки',
  },
  'mangal-i-ogon': {
    title: 'Мангал и огонь в беседке — блог Реал Беседки',
    description:
      'Мангал, дымоход и зона готовки в металлической беседке. Что закладываем в каркас 80×80 и как монтируем в Москве и МО.',
    h1: 'Мангал и огонь в беседке',
  },
  razmery: {
    title: 'Размеры металлических беседок — блог Реал Беседки',
    description:
      'Размеры беседок 3×3, 3×4, 4×4 и другие: как выбрать под участок. Каркас 80×80, пол фанера в базе, Москва и МО.',
    h1: 'Размеры металлических беседок',
  },
  'zakaz-i-dogovor': {
    title: 'Заказ и договор на беседку — блог Реал Беседки',
    description:
      'Как заказать металлическую беседку: расчёт, договор, сроки. Производство ООО «Пулман», каркас 80×80.',
    h1: 'Заказ и договор',
  },
  'zakaz-i-montazh': {
    title: 'Заказ и монтаж металлической беседки — блог Реал Беседки',
    description:
      'Заказ и монтаж беседки: замер, доставка, установка на участке в Москве и МО. Каркас 80×80, пол фанера в базе.',
    h1: 'Заказ и монтаж',
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
