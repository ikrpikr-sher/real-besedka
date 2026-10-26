import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProjectConfigurator from '@/components/ProjectConfigurator';
import PaymentMethods from '@/components/PaymentMethods';
import JsonLd from '@/components/JsonLd';
import ProductMedia from '@/components/ProductMedia';
import { getCatalogCategory, isCatalogCategory } from '@/lib/catalogCategories';
import { getProductModel3dUrl } from '@/lib/catalogModels';
import { withImageCacheBustList } from '@/lib/catalogImages';
import {
  CATALOG_COMMON_SPECS,
  CATALOG_LEAD_TIME,
  getProductSpecs,
  stripCatalogTimingFromDescription,
} from '@/lib/catalogSpecs';
import { BRAND_NAME } from '@/lib/brand';
import { getCatalogItem, getCatalogItemUrl, getCatalogArticle, getKontakty, getKatalog, getSite } from '@/lib/content';
import { getProductMetaDescription } from '@/lib/productSeoDescription';
import { getConfiguratorProfile } from '@/lib/productOptions';
import PavilionVentilation, { showPavilionVentilation } from '@/components/PavilionVentilation';

type Props = { params: { category: string; slug: string } };

export const revalidate = 300;

export function generateStaticParams() {
  return getKatalog().map((item) => ({ category: item.category, slug: item.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const item = getCatalogItem(params.category, params.slug);
  if (!item) return {};
  const site = getSite();
  const seoTitle = `${item.title} — ${item.size}, от ${item.priceFrom.toLocaleString('ru-RU')} ₽`;
  const description = getProductMetaDescription(item);
  const itemUrl = getCatalogItemUrl(item);
  const ogImage = item.images[0]
    ? item.images[0].startsWith('http')
      ? item.images[0]
      : `${site.siteUrl}${item.images[0]}`
    : undefined;
  return {
    title: { absolute: `${seoTitle} | ${BRAND_NAME}` },
    description,
    alternates: { canonical: itemUrl },
    // Next.js 14 Metadata не принимает og:type=product — на проде nginx
    // (location карточки) подменяет website → product. Не ставить type:'product' здесь.
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName: site.siteName,
      title: seoTitle,
      description,
      url: `${site.siteUrl}${itemUrl}`,
      ...(ogImage ? { images: [{ url: ogImage, alt: item.title }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: seoTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default function KatalogItemPage({ params }: Props) {
  if (!isCatalogCategory(params.category)) notFound();

  const item = getCatalogItem(params.category, params.slug);
  if (!item) notFound();

  const cat = getCatalogCategory(params.category)!;
  const itemUrl = getCatalogItemUrl(item);
  const site = getSite();
  const kontakty = getKontakty();
  const article = getCatalogArticle(item.slug);
  const configProfile = getConfiguratorProfile(item.configuratorId);
  const model3d = getProductModel3dUrl(item);
  const galleryImages = withImageCacheBustList(item.images);
  const specs = getProductSpecs(item);
  const descriptionText = stripCatalogTimingFromDescription(item.description);

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    description: descriptionText,
    sku: article,
    mpn: article,
    brand: { '@type': 'Brand', name: BRAND_NAME },
    image: item.images.map((img) => (img.startsWith('http') ? img : `${site.siteUrl}${img}`)),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: item.priceFrom,
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability: 'https://schema.org/InStock',
      url: `${site.siteUrl}${itemUrl}`,
      seller: {
        '@type': 'Organization',
        name: site.legalName,
        url: site.siteUrl,
      },
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${site.siteUrl}/katalog` },
      { '@type': 'ListItem', position: 3, name: cat.title, item: `${site.siteUrl}/katalog/${cat.slug}` },
      { '@type': 'ListItem', position: 4, name: item.title, item: `${site.siteUrl}${itemUrl}` },
    ],
  };

  return (
    <Container className="page-section">
      <JsonLd data={[productLd, breadcrumbLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/katalog' },
          { label: cat.shortTitle, href: `/katalog/${cat.slug}` },
          { label: item.title, href: itemUrl },
        ]}
      />
      <div className="grid gap-8 md:grid-cols-3 lg:gap-10">
        <div className="md:col-span-2">
          <h1 className="page-title">{item.title}</h1>
          <p className="mt-2 text-sm text-text-muted">
            Модель {article} · {item.size}
          </p>
          {item.tagline ? <p className="mt-2 text-lg text-text-muted">{item.tagline}</p> : null}
          <ProductMedia title={item.title} images={galleryImages} model3d={model3d} />
          <p className="text-text-muted">{descriptionText}</p>
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-text">Технические характеристики</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-text-muted">{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-text-muted">Артикул</dt>
                <dd>{article}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Материал</dt>
                <dd>{item.material}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Размер</dt>
                <dd>{item.size}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Кровля</dt>
                <dd>{item.roof}</dd>
              </div>
              {CATALOG_COMMON_SPECS.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-text-muted">{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {showPavilionVentilation(item.category, item.slug) ? (
            <PavilionVentilation slug={item.slug} />
          ) : null}
          <p className="mt-6 text-xl font-semibold text-accent">
            от {item.priceFrom.toLocaleString('ru-RU')} ₽
          </p>
          <p className="mt-2 text-sm text-text-muted">
            {configProfile.baseNote ??
              'Базовая комплектация: без стен, пол — фанера. Дополнительные опции — в блоке справа.'}
          </p>
          <p className="mt-3 text-sm text-text-muted">
            Цена «от» — старт комплектации. Точную сумму соберите в калькуляторе справа или в{' '}
            <a className="text-accent underline-offset-2 hover:underline" href="/konfigurator">
              конфигураторе
            </a>
            . Фото и объекты — в{' '}
            <a className="text-accent underline-offset-2 hover:underline" href="/proekty">
              портфолио
            </a>
            , отзывы — на{' '}
            <a className="text-accent underline-offset-2 hover:underline" href="/otzyvy">
              странице отзывов
            </a>
            .
          </p>
        </div>
        <div className="md:col-span-1 lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 text-sm font-medium text-text">Калькулятор комплектации</p>
          <ProjectConfigurator
            projectTitle={item.title}
            basePrice={item.priceFrom}
            configuratorId={item.configuratorId}
          />
          {kontakty.paymentMethods ? (
            <div className="mt-6">
              <PaymentMethods
                title={kontakty.paymentMethods.title}
                items={kontakty.paymentMethods.items}
                compact
              />
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
