import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import CommerceHubNav from '@/components/CommerceHubNav';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-4x4';

const FAQ_ITEMS = [
  {
    question: '4×4 — это 16 м² пола?',
    answer:
      'Пятно 4×4 = 16 м² в осях. Полезный пол чуть меньше из-за стоек и панелей. У B-11 высота конька 3,0 м.',
  },
  {
    question: 'Чем 4×4 лучше 3×4?',
    answer:
      'Больше проход за стульями и место под квадратный стол. На 8 человек хватает 3×4; на регулярные 12 — берите 4×4.',
  },
  {
    question: 'Можно ли мангал внутри 4×4?',
    answer:
      'Да, серия «Огонь» BM-11. В открытую B-11 очаг не встраиваем — рядом отдельная чаша или зона.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 4×4 (4 на 4) из металла — от 230 000 ₽, Богатыри и Салон | Реал Беседки',
    description: 'Металлическая беседка 4×4: открытая B-11 от 230 000 ₽, остеклённая «Салон» B-23 от 490 000 ₽, с мангалом BM-11 от 430 000 ₽. Каркас 80×80, Москва и МО.',
  });
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: PATH },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: PATH,
      locale: 'ru_RU',
      type: 'website',
      images: [{ url: '/images/proekty/b-11-1.webp', width: 1200, height: 800 }],
    },
  };
}

export default function HubPage() {
  const site = getSite();
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Беседка 4×4 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 4×4: открытая B-11 от 230 000 ₽, остеклённая «Салон» B-23 от 490 000 ₽, с мангалом BM-11 от 430 000 ₽. Каркас 80×80, Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 4×4', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Квадрат под стол на компанию 10–12</p>
      <h1 className="page-title mb-4">Беседка 4×4 (4 на 4) из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        4×4 м — следующий шаг после 3×4, когда гости регулярно больше десяти или нужен квадратный стол без «коридора». Пятно 16 м² в осях: проход за стульями остаётся, не упираетесь в стойки.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        У нас это не одна модель. Открытая «Богатыри» B-11 — от 230 000 ₽. Остеклённый «Салон» B-23 — от 490 000 ₽. С мангалом внутри — BM-11 «Огонь · 4×4» от 430 000 ₽. Лазер 2 м B-43 — от 520 000 ₽.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модели 4×4</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Контур</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-11">B-11 Богатыри</Link></td>
              <td className="py-2 pr-3">открытая 4×4×3 м</td>
              <td className="py-2">230 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-mangalom/bm-11">BM-11 Огонь</Link></td>
              <td className="py-2 pr-3">мангал внутри 4×4</td>
              <td className="py-2">430 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-23">B-23 Салон</Link></td>
              <td className="py-2 pr-3">стекло 4×4×2,7 м</td>
              <td className="py-2">490 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-43">B-43 Вавилон</Link></td>
              <td className="py-2 pr-3">открытая, лазер 2 м</td>
              <td className="py-2">520 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-33">B-33 Панорама · Вавилон</Link></td>
              <td className="py-2 pr-3">стекло + лазер</td>
              <td className="py-2">740 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Сколько человек</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Стол 200–220 см: комфортно 10–12, банкет на 14 уже в проходах. Для двоих 4×4 избыточна — смотрите 2×3 или 3×3. Если нужен длинный стол вдоль фасада без квадрата — сравните с <Link className="text-accent hover:underline" href="/besedka-3x4">3×4</Link>.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Посадка на участке</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Квадрат проще развернуть к виду: любая сторона — фасад. От забора в МО проверяйте устав СНТ (часто 1–3 м). Каркас 80×80×3 мм, кровля металлочерепица, монтаж на сваи или плиту за день после готовности основания.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-11">
          B-11 в каталоге
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          3×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-5x4">
          5×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">
          С мангалом
        </Link>
      </p>

      <CommerceHubNav current="/besedka-4x4" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-4x4" />
      </div>
    </Container>
  );
}
