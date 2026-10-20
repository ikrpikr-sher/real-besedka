import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: { absolute: 'Страница не найдена' },
  description: 'Такой страницы нет. Откройте каталог металлических беседок или оставьте заявку на расчёт.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="page-section">
      <h1 className="page-title mb-4">Страница не найдена</h1>
      <p className="mb-6 max-w-xl text-text-muted">
        Такой страницы нет. Откройте каталог металлических беседок или оставьте заявку на расчёт.
      </p>
      <p className="text-sm">
        <Link className="text-accent hover:underline" href="/katalog">
          Каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Рассчитать модель
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/">
          На главную
        </Link>
      </p>
    </Container>
  );
}
