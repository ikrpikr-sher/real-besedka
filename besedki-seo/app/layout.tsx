import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import Analytics from '@/components/Analytics';
import { BRAND_NAME } from '@/lib/brand';
import { getSite, TWOGIS_FIRM_URL } from '@/lib/content';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export async function generateMetadata(): Promise<Metadata> {
  const site = getSite();
  return {
    metadataBase: new URL(site.siteUrl),
    title: {
      default: `${BRAND_NAME} — металлические беседки под ключ в Москве и МО`,
      template: '%s',
    },
    description: site.description,
    alternates: {
      types: {
        'application/rss+xml': [{ url: '/feeds/dzen.xml', title: `${site.siteName}: блог` }],
      },
    },
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName: site.siteName,
    },
    verification: {
      google: 'SKXWe0zy46qQPofNspu1kYlZh03KOnApoKB-M8mPCAg',
      other: {
        'p:domain_verify': '2615e9e3726346517a6d030487fec47f',
        'zen-verification': 'Xyo3l7VY245HuojnPCBQ67is5Nv5ZNnxsohJDQzSOoSIHTiGNVUNx88bwqFfHJVI',
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  const geo = site.geo ?? { latitude: 55.80595, longitude: 37.59315 };
  const openingHours = site.openingHours ?? 'Mo-Sa 09:00-19:00';
  const sameAs = [
    ...new Set(
      [
        ...Object.values(site.social || {}),
        'https://ru.pinterest.com/realbesedki/',
        'https://dzen.ru/realbesedki',
        TWOGIS_FIRM_URL,
      ].filter(
        (href): href is string =>
          typeof href === 'string' && href.startsWith('http') && !href.includes('vk.com/realbesedki'),
      ),
    ),
  ];
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.siteName,
    alternateName: ['REAL БЕСЕДКИ', 'Real Besedki', site.legalName],
    url: site.siteUrl,
    logo: `${site.siteUrl}${site.logo}`,
    image: `${site.siteUrl}${site.logo}`,
    telephone: site.phone,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.streetAddress,
      addressLocality: site.address.addressLocality,
      addressRegion: site.address.addressRegion,
      postalCode: site.address.postalCode || '127018',
      addressCountry: site.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    openingHours,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00',
    },
    areaServed: site.serviceArea,
    hasMap: TWOGIS_FIRM_URL,
    sameAs,
  };
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.siteName,
    url: site.siteUrl,
  };

  return (
    <html lang="ru">
      <body className="font-body">
        <style
          dangerouslySetInnerHTML={{
            __html:
              'html,body{margin:0;background:#FAF6EF;color:#171717;font-family:system-ui,-apple-system,sans-serif}',
          }}
        />
        <JsonLd data={[orgLd, websiteLd]} />
        <Analytics />
        <Header />
        <main className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-[env(safe-area-inset-bottom)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
