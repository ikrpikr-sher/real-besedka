import type { Metadata } from 'next';
import NavLink from '@/components/NavLink';
import Container from '@/components/Container';
import ProjectCard from '@/components/ProjectCard';
import ArticleCard from '@/components/ArticleCard';
import LeadForm from '@/components/LeadForm';
import PaymentMethods from '@/components/PaymentMethods';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import { getKatalog, getHome, getKontakty, getSite } from '@/lib/content';
import { getAllPosts } from '@/lib/blog';
import { getSeo } from '@/lib/seo';

const HOME_FAQ = [
  {
    question: 'Какой каркас у беседок?',
    answer: 'Профильная труба 80×80×3 мм, порошковая окраска, болтовой монтаж. Не тонкий уголок под поликарбонат.',
  },
  {
    question: 'Сколько стоит металлическая беседка?',
    answer: 'Открытые — от 95 000 ₽ (2×2). Хиты 3×3 / 3×4 / 4×4 — от 185–240 тысяч в зависимости от модели. Остекление «Панорама» — от 400 000 ₽.',
  },
  {
    question: 'Делаете дерево?',
    answer: 'Нет. Только металл и ЧПУ-панели. Сравнение рынков — на странице «металл или дерево».',
  },
  {
    question: 'Монтаж в Москве и МО?',
    answer: 'Да. Типовая открытая — около 1 дня после готовности основания. Доставка и монтаж — отдельной строкой в смете.',
  },
];

export const revalidate = 300;

export function generateMetadata(): Metadata {
  const site = getSite();
  const seo = getSeo('/', {
    title: 'Металлические беседки под ключ в Москве — Реал Беседки',
    description: site.description,
  });
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: '/' },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: site.siteUrl,
      images: [{ url: `${site.siteUrl}/images/hero-besedka.webp`, alt: site.siteName }],
    },
  };
}

export default function HomePage() {
  const home = getHome();
  const katalog = getKatalog();
  const openBesedki = katalog.filter((item) => item.category === 'otkrytye-besedki');
  const glazedBesedki = katalog.filter((item) => item.category === 'besedki-s-ostekleniem');
  const loftC8 = katalog.find((item) => item.slug === 'b-53');
  const homeCatalogCols = 4;
  const homeCatalogRows = 3;
  const homeCatalogLimit = homeCatalogCols * homeCatalogRows;

  let homeCatalogItems = [
    ...openBesedki.slice(0, homeCatalogCols * 2),
    ...glazedBesedki.slice(0, homeCatalogCols),
  ].slice(0, homeCatalogLimit);

  if (loftC8) {
    homeCatalogItems = homeCatalogItems.filter((item) => item.slug !== loftC8.slug);
    const head = homeCatalogItems.slice(0, 8);
    const tail = homeCatalogItems.slice(8, homeCatalogLimit - 1);
    homeCatalogItems = [...head, loftC8, ...tail].slice(0, homeCatalogLimit);
  }
  const site = getSite();
  const kontakty = getKontakty();
  const latestPosts = getAllPosts().slice(0, 6);
  const homeFaqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <link rel="preload" as="image" href="/images/hero-besedka.webp" fetchPriority="high" />
      <JsonLd data={homeFaqLd} />
      <section className="relative overflow-hidden border-b border-border py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0 bg-bg" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-besedka.webp"
            alt=""
            width={1600}
            height={900}
            className="h-full w-full object-cover opacity-90 brightness-110"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {home.hero.badges?.map((badge) => (
                  <span
                    key={badge}
                    className="hero-overlay-text rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <h1 className="hero-overlay-text max-w-2xl font-heading text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
                {home.hero.title}
              </h1>
              <p className="hero-overlay-text mt-4 max-w-xl text-base font-medium leading-relaxed text-white/95 sm:text-lg">
                {home.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <NavLink href={home.hero.ctaHref} className="btn-primary">
                  {home.hero.ctaLabel}
                </NavLink>
                {home.hero.secondaryCtaHref && (
                  <NavLink href={home.hero.secondaryCtaHref} className="btn-hero-outline hero-overlay-text">
                    {home.hero.secondaryCtaLabel}
                  </NavLink>
                )}
              </div>
              <p className="hero-overlay-text mt-4 text-sm text-white/90">
                или звоните{' '}
                <a
                  href={`tel:${site.phone.replace(/[^\d+]/g, '')}`}
                  className="font-semibold text-white underline decoration-white/50 underline-offset-2 hover:decoration-white"
                >
                  {site.phone}
                </a>
              </p>
            </div>
            <div id="raschet" className="card overflow-hidden p-0">
              <LeadForm context="Главная — расчёт беседки" compact />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-border bg-surface py-10 md:py-12">
        <Container>
          <h2 className="mb-2 font-heading text-2xl">Технология производства</h2>
          <p className="mb-6 max-w-2xl text-text-muted">
            Каждая беседка — металлоконструкция с дизайнерской отделкой. Вот из чего она состоит:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {home.specs.map((s) => (
              <div key={s.title} className="rounded-DEFAULT border border-border bg-bg p-4">
                <h3 className="font-heading text-base">{s.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-10 md:py-12">
        <Container>
          <h2 className="mb-2 font-heading text-2xl">Подобрать под задачу</h2>
          <p className="mb-6 max-w-2xl text-text-muted">
            Не каталог ради каталога: сначала задача, потом модель и цена с карточки.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: '/osteklennaya-besedka',
                title: 'Остекление под ключ',
                text: 'Стеклопакет на 80×80, зима и ветер. Не мягкие окна.',
              },
              {
                href: '/besedka-3x4',
                title: 'Беседка 3×4',
                text: 'Стол на 8–10, хит участка в МО. Открытая, лазер или стекло.',
              },
              {
                href: '/kupit-besedku',
                title: 'Купить беседку',
                text: 'Заводской заказ: договор ООО «Пулман», монтаж в Москве и МО.',
              },
              {
                href: '/besedka-s-mangalom-pod-klyuch',
                title: 'С мангалом',
                text: 'Очаг внутри контура, дымоход. Серия «Огонь».',
              },
            ].map((item) => (
              <NavLink key={item.href} href={item.href} className="card block h-full hover:shadow-md">
                <h3 className="font-heading text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{item.text}</p>
              </NavLink>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-10 md:py-12">
        <Container>
          <h2 className="mb-6 font-heading text-2xl">Каталог беседок</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {homeCatalogItems.map((p, index) => (
              <ProjectCard key={p.slug} project={p} priority={index < 2} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <NavLink href="/katalog" className="btn-secondary inline-flex px-8 py-3">
              Все модели
            </NavLink>
          </div>
          <nav
            className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-text-muted"
            aria-label="Популярные разделы"
          >
            <NavLink href="/besedka-3x4" className="hover:text-accent">
              Беседка 3×4
            </NavLink>
            <NavLink href="/besedka-4x4" className="hover:text-accent">
              Беседка 4×4
            </NavLink>
            <NavLink href="/besedka-3x3" className="hover:text-accent">
              Беседка 3×3
            </NavLink>
            <NavLink href="/besedka-2x3" className="hover:text-accent">
              Беседка 2×3
            </NavLink>
            <NavLink href="/besedka-2x2" className="hover:text-accent">
              Беседка 2×2
            </NavLink>
            <NavLink href="/besedka-6x3" className="hover:text-accent">
              Беседка 6×3
            </NavLink>
            <NavLink href="/shestigrannaya-besedka" className="hover:text-accent">
              Шестигранные
            </NavLink>
            <NavLink href="/besedka-dlya-dachi" className="hover:text-accent">
              Для дачи
            </NavLink>
            <NavLink href="/besedka-panorama" className="hover:text-accent">
              Панорама
            </NavLink>
            <NavLink href="/mangalnaya-zona" className="hover:text-accent">
              Мангальные зоны
            </NavLink>
            <NavLink href="/sadovye-kacheli" className="hover:text-accent">
              Качели
            </NavLink>
            <NavLink href="/zakazat-besedku" className="hover:text-accent">
              Заказать
            </NavLink>
            <NavLink href="/besedka-iz-metalla" className="hover:text-accent">
              Из металла
            </NavLink>
            <NavLink href="/metallicheskie-besedki" className="hover:text-accent">
              Металлические
            </NavLink>
            <NavLink href="/besedka-iz-metalloprofilja" className="hover:text-accent">
              Из металлопрофиля
            </NavLink>
            <NavLink href="/besedka-metall-ili-derevo" className="hover:text-accent">
              Металл или дерево
            </NavLink>
            <NavLink href="/metallicheskaya-besedka" className="hover:text-accent">
              Металлическая
            </NavLink>
            <NavLink href="/kupit-besedku" className="hover:text-accent">
              Купить беседку
            </NavLink>
            <NavLink href="/besedki-moskva" className="hover:text-accent">
              Беседки Москва
            </NavLink>
            <NavLink href="/besedka-s-mangalnoy-zonoy" className="hover:text-accent">
              С мангальной зоной
            </NavLink>
            <NavLink href="/besedka-s-barbekyu" className="hover:text-accent">
              С барбекю
            </NavLink>
            <NavLink href="/besedka-naves" className="hover:text-accent">
              Беседка-навес
            </NavLink>
            <NavLink href="/besedka-6x6" className="hover:text-accent">
              Беседка 6×6
            </NavLink>
            <NavLink href="/besedka-5x5" className="hover:text-accent">
              Беседка 5×5
            </NavLink>
            <NavLink href="/besedka-medvedi" className="hover:text-accent">
              Медведи
            </NavLink>
            <NavLink href="/besedka-oleni" className="hover:text-accent">
              Олени
            </NavLink>
            <NavLink href="/otkrytaya-besedka" className="hover:text-accent">
              Открытые
            </NavLink>
            <NavLink href="/zakrytaya-besedka" className="hover:text-accent">
              Закрытые
            </NavLink>
            <NavLink href="/zimnyaya-besedka" className="hover:text-accent">
              Зимние
            </NavLink>
            <NavLink href="/besedka-loft" className="hover:text-accent">
              Лофт
            </NavLink>
            <NavLink href="/osteklennaya-besedka" className="hover:text-accent">
              Остеклённые
            </NavLink>
            <NavLink href="/besedka-s-mangalom-pod-klyuch" className="hover:text-accent">
              С мангалом
            </NavLink>
            <NavLink href="/besedka-pod-klyuch" className="hover:text-accent">
              Под ключ
            </NavLink>
            <NavLink href="/metallicheskiy-naves" className="hover:text-accent">
              Навесы
            </NavLink>
            <NavLink href="/tseny-na-besedki" className="hover:text-accent">
              Цены
            </NavLink>
            <NavLink href="/kupit-metallicheskuyu-besedku" className="hover:text-accent">
              Купить
            </NavLink>
          </nav>
        </Container>
      </section>

      {home.process && (
        <section className="border-b border-border bg-surface py-10 md:py-12">
          <Container>
            <h2 className="mb-6 font-heading text-2xl">{home.process.title}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {home.process.steps.map((step, i) => (
                <div key={step.title} className="relative">
                  <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="font-heading text-base">{step.title}</h3>
                  <p className="mt-2 text-sm text-text-muted">{step.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="border-b border-border py-10 md:py-12">
        <Container className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {home.advantages.map((a) => (
              <div key={a.title} className="card h-full">
                <h3 className="font-heading text-lg">{a.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{a.text}</p>
              </div>
            ))}
          </div>

          {home.trust && (
            <div className="grid gap-4 sm:grid-cols-3">
              {home.trust.items.map((item) => (
                <div key={item.label} className="card text-center">
                  <p className="font-heading text-3xl text-accent">{item.value}</p>
                  <p className="mt-1 text-sm text-text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="border-b border-border py-10 md:py-12">
        <Container>
          <h2 className="mb-6 font-heading text-2xl">Частые вопросы</h2>
          <FAQ items={HOME_FAQ} />
        </Container>
      </section>

      {latestPosts.length > 0 && (
        <section className="border-b border-border bg-surface py-10 md:py-12">
          <Container>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-heading text-2xl">Полезные статьи</h2>
              <NavLink href="/blog" className="text-sm text-accent hover:underline">
                Все статьи →
              </NavLink>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <ArticleCard key={post.slug} article={post} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {kontakty.paymentMethods ? (
        <section className="border-b border-border py-10 md:py-12">
          <Container>
            <PaymentMethods
              title={kontakty.paymentMethods.title}
              intro={kontakty.paymentMethods.intro}
              items={kontakty.paymentMethods.items}
            />
          </Container>
        </section>
      ) : null}

      {home.bottomCta && (
        <section className="bg-text py-10 md:py-12 text-bg">
          <Container className="text-center">
            <h2 className="font-heading text-2xl md:text-3xl">{home.bottomCta.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-bg/80">{home.bottomCta.text}</p>
            <NavLink href={home.bottomCta.ctaHref} className="btn-primary mt-6 bg-accent-alt hover:bg-accent">
              {home.bottomCta.ctaLabel}
            </NavLink>
          </Container>
        </section>
      )}
    </>
  );
}
