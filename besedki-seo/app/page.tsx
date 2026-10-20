import type { Metadata } from 'next';
import NavLink from '@/components/NavLink';
import Container from '@/components/Container';
import ProjectCard from '@/components/ProjectCard';
import ArticleCard from '@/components/ArticleCard';
import LeadForm from '@/components/LeadForm';
import PaymentMethods from '@/components/PaymentMethods';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import HomeSeoLinks from '@/components/HomeSeoLinks';
import { getKatalog, getHome, getKontakty, getSite } from '@/lib/content';
import { getAllPosts } from '@/lib/blog';
import { getSeo } from '@/lib/seo';
import { pickCardImage, withCardImageCacheBust } from '@/lib/catalogImages';

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
  const mangalBesedki = katalog.filter((item) => item.category === 'besedki-s-mangalom');
  const loftC8 = katalog.find((item) => item.slug === 'b-53');
  const size34 = katalog.find((item) => /3\s*[×x]\s*4/i.test(item.size || '') || /3x4/i.test(item.slug));
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

  const hubPhoto = (images?: string[]) => {
    const raw = pickCardImage(images ?? []) ?? images?.[0];
    return raw ? withCardImageCacheBust(raw) : undefined;
  };

  const hubs = [
    {
      href: '/osteklennaya-besedka',
      title: 'Остекление под ключ',
      text: 'Стеклопакет на 80×80. Зима в МО — не плёнка на липучках.',
      image: hubPhoto((loftC8 ?? glazedBesedki[0])?.images),
    },
    {
      href: '/besedka-3x4',
      title: 'Беседка 3×4',
      text: 'Стол на 8–10. Хит участка: открытая, лазер или стекло.',
      image: hubPhoto(size34?.images ?? openBesedki[1]?.images),
    },
    {
      href: '/besedka-s-mangalom-pod-klyuch',
      title: 'С мангалом',
      text: 'Очаг внутри контура, дымоход. Серия «Огонь».',
      image: hubPhoto(mangalBesedki[0]?.images ?? openBesedki[2]?.images),
    },
    {
      href: '/kupit-besedku',
      title: 'Купить с завода',
      text: 'Договор ООО «Пулман», монтаж в Москве и МО.',
      image: hubPhoto(openBesedki[0]?.images),
    },
  ];

  return (
    <>
      <link rel="preload" as="image" href="/images/hero-besedka.webp" fetchPriority="high" />
      <JsonLd data={homeFaqLd} />
      <section className="relative min-h-[min(92svh,880px)] overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-bg" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-besedka.webp"
            alt=""
            width={1600}
            height={900}
            className="h-full w-full object-cover object-[center_40%] scale-[1.02]"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </div>
        <Container className="relative z-10 flex min-h-[min(92svh,880px)] flex-col justify-center py-14 sm:py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,400px)] lg:items-center lg:gap-14">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                {home.hero.badges?.map((badge) => (
                  <span
                    key={badge}
                    className="hero-overlay-text rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/95 backdrop-blur-[2px]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <h1 className="hero-overlay-text max-w-xl font-heading text-[2.15rem] leading-[1.12] text-white sm:text-5xl md:text-[3.35rem]">
                {home.hero.title}
              </h1>
              <p className="hero-overlay-text mt-5 max-w-lg text-base font-medium leading-relaxed text-white/90 sm:text-lg">
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
              <p className="hero-overlay-text mt-5 text-sm text-white/85">
                или сразу{' '}
                <a
                  href={`tel:${site.phone.replace(/[^\d+]/g, '')}`}
                  className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  {site.phone}
                </a>
              </p>
            </div>
            <div id="raschet" className="hero-lead-card overflow-hidden">
              <LeadForm context="Главная — расчёт беседки" compact />
            </div>
          </div>
        </Container>
      </section>

      {home.trust ? (
        <section className="border-b border-border bg-text text-bg">
          <Container className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {home.trust.items.map((item) => (
              <div key={item.label} className="px-2 py-6 text-center sm:py-8">
                <p className="font-heading text-3xl tracking-tight md:text-4xl">{item.value}</p>
                <p className="mt-1.5 text-sm text-bg/70">{item.label}</p>
              </div>
            ))}
          </Container>
        </section>
      ) : null}

      <section className="border-b border-border py-14 md:py-20">
        <Container>
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">Каталог</p>
              <h2 className="font-heading text-3xl leading-tight md:text-4xl">Беседки, которые ставят на участок</h2>
              <p className="mt-3 max-w-xl text-text-muted">
                Цена — с карточки модели. Сначала кадр и размер, потом расчёт под ваш грунт.
              </p>
            </div>
            <NavLink href="/katalog" className="btn-secondary shrink-0 px-6">
              Все модели
            </NavLink>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {homeCatalogItems.map((p, index) => (
              <ProjectCard key={p.slug} project={p} priority={index < 4} />
            ))}
          </div>
          <HomeSeoLinks />
        </Container>
      </section>

      <section className="border-b border-border bg-surface py-14 md:py-20">
        <Container>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">Задача</p>
          <h2 className="mb-3 font-heading text-3xl md:text-4xl">С чего начать</h2>
          <p className="mb-8 max-w-xl text-text-muted">Не витрина ради витрины: сначала сцена на участке, потом модель.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hubs.map((item) => (
              <NavLink key={item.href} href={item.href} className="group overflow-hidden rounded-DEFAULT bg-bg shadow-sm ring-1 ring-border transition hover:shadow-md">
                <div className="aspect-[4/3] overflow-hidden bg-border">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      width={640}
                      height={480}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-lg leading-snug">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-muted">{item.text}</p>
                </div>
              </NavLink>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-14 md:py-16">
        <Container>
          <h2 className="mb-2 font-heading text-3xl">Из чего собрано</h2>
          <p className="mb-8 max-w-xl text-text-muted">Металлоконструкция с отделкой, не поликарбонатный набор.</p>
          <div className="grid gap-px overflow-hidden rounded-DEFAULT bg-border sm:grid-cols-2 lg:grid-cols-3">
            {home.specs.map((s) => (
              <div key={s.title} className="bg-bg px-5 py-5">
                <h3 className="font-heading text-base">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {home.process && (
        <section className="border-b border-border bg-surface py-14 md:py-16">
          <Container>
            <h2 className="mb-8 font-heading text-3xl">{home.process.title}</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {home.process.steps.map((step, i) => (
                <div key={step.title} className="relative">
                  <span className="mb-3 block font-heading text-4xl leading-none text-accent/30">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-heading text-lg">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="border-b border-border py-14 md:py-16">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {home.advantages.map((a) => (
              <div key={a.title} className="border-t border-border pt-5">
                <h3 className="font-heading text-xl">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{a.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-14 md:py-16">
        <Container>
          <h2 className="mb-6 font-heading text-3xl">Частые вопросы</h2>
          <FAQ items={HOME_FAQ} />
        </Container>
      </section>

      {latestPosts.length > 0 && (
        <section className="border-b border-border bg-surface py-14 md:py-16">
          <Container>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-heading text-3xl">С участка и с производства</h2>
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
        <section className="border-b border-border py-12 md:py-14">
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
        <section className="bg-text py-16 text-bg md:py-20">
          <Container className="max-w-2xl text-center">
            <h2 className="font-heading text-3xl md:text-4xl">{home.bottomCta.title}</h2>
            <p className="mx-auto mt-4 text-bg/75">{home.bottomCta.text}</p>
            <NavLink href={home.bottomCta.ctaHref} className="btn-primary mt-8 bg-accent-alt hover:bg-accent">
              {home.bottomCta.ctaLabel}
            </NavLink>
          </Container>
        </section>
      )}
    </>
  );
}
