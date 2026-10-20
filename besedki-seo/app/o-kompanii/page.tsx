import type { Metadata } from 'next';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PaymentMethods from '@/components/PaymentMethods';
import { getKontakty, getOKompanii } from '@/lib/content';
import { getSeo } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const seo = getSeo('/o-kompanii', {
    title: 'О компании',
    description: 'Проектируем и строим дизайнерские беседки под ключ — команда, портфолио, гарантии.',
  });
  return { title: seo.title, description: seo.description, alternates: { canonical: '/o-kompanii' } };
}

export default function AboutPage() {
  const data = getOKompanii();
  const kontakty = getKontakty();

  return (
    <Container className="page-section">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'О компании', href: '/o-kompanii' }]} />
      <h1 className="page-title">{data.title}</h1>
      <p className="max-w-2xl text-text-muted">{data.intro}</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {data.stats.map((s) => (
          <div key={s.label} className="card text-center">
            <p className="font-heading text-3xl text-accent">{s.value}</p>
            <p className="mt-1 text-sm text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>
      {kontakty.paymentMethods ? (
        <div className="mt-10 border-t border-border pt-10">
          <PaymentMethods
            title={kontakty.paymentMethods.title}
            intro={kontakty.paymentMethods.intro}
            items={kontakty.paymentMethods.items}
          />
        </div>
      ) : null}
      <h2 className="mt-10 font-heading text-2xl">Команда</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.team.map((member) => (
          <div key={member.name} className="card overflow-hidden p-0">
            {member.coverImage ? (
              <div className="aspect-[16/9] overflow-hidden bg-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={member.coverImage} alt={member.name} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ) : null}
            <div className="p-4">
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-accent">{member.role}</p>
              <p className="mt-1 text-sm text-text-muted">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
