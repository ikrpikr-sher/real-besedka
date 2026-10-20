import type { Metadata } from 'next';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeadForm from '@/components/LeadForm';
import PaymentMethods from '@/components/PaymentMethods';
import TelegramLink from '@/components/TelegramLink';
import JsonLd from '@/components/JsonLd';
import { getKontakty, getSite, TWOGIS_FIRM_URL } from '@/lib/content';
import { getSeo } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const seo = getSeo('/kontakty', {
    title: 'Контакты',
    description: 'Оставьте заявку на проектирование и монтаж беседки — свяжемся в течение рабочего дня.',
  });
  return { title: seo.title, description: seo.description, alternates: { canonical: '/kontakty' } };
}

export default function ContactsPage() {
  const data = getKontakty();
  const site = getSite();
  const telegramHref = site.telegram || site.social?.telegram || '';
  const contactLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: data.title,
    url: `${site.siteUrl}/kontakty`,
    mainEntity: {
      '@type': 'LocalBusiness',
      name: site.siteName,
      telephone: site.phone,
      email: site.email,
      url: site.siteUrl,
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address?.streetAddress || data.address,
        addressLocality: site.address?.addressLocality || 'Москва',
        postalCode: site.address?.postalCode || '127018',
        addressCountry: 'RU',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: site.geo?.latitude ?? 55.80595,
        longitude: site.geo?.longitude ?? 37.59315,
      },
      hasMap: TWOGIS_FIRM_URL,
      openingHours: site.openingHours || 'Mo-Sa 09:00-19:00',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
    },
  };

  return (
    <Container className="page-section">
      <JsonLd data={contactLd} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Контакты', href: '/kontakty' }]} />
      <h1 className="page-title">{data.title}</h1>
      <div className="grid gap-8 md:grid-cols-3 lg:gap-10">
        <div className="md:col-span-2">
          <p className="text-text-muted">{data.intro}</p>
          <dl className="mt-6 space-y-2 text-sm">
            <div>
              <dt className="text-text-muted">Телефон</dt>
              <dd>
                <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className="hover:text-accent">
                  {site.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Telegram</dt>
              <dd>
                <TelegramLink href={telegramHref} showLabel label="@real_groupp" />
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Email</dt>
              <dd>{site.email}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Адрес</dt>
              <dd>
                <a
                  href={TWOGIS_FIRM_URL}
                  className="hover:text-accent"
                  rel="noopener noreferrer"
                >
                  {data.address}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">2ГИС</dt>
              <dd>
                <a
                  href={TWOGIS_FIRM_URL}
                  className="hover:text-accent"
                  rel="noopener noreferrer"
                >
                  Real Besedki на карте
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Часы работы</dt>
              <dd>{data.workHours}</dd>
            </div>
          </dl>

          {data.paymentMethods ? (
            <div className="mt-10">
              <PaymentMethods
                id="sposoby-oplaty"
                title={data.paymentMethods.title}
                intro={data.paymentMethods.intro}
                items={data.paymentMethods.items}
              />
            </div>
          ) : null}
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <LeadForm context="Страница контактов" />
        </div>
      </div>
    </Container>
  );
}
