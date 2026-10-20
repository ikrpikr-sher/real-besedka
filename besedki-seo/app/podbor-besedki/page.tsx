import type { Metadata } from 'next';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getQuiz } from '@/lib/content';
import QuizClient from './QuizClient';
import { getSeo } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const seo = getSeo('/podbor-besedki', {
    title: 'Подбор беседки — квиз',
    description: 'Ответьте на 5 вопросов — подберём тип и материал беседки под ваш участок и бюджет.',
  });
  return { title: seo.title, description: seo.description, alternates: { canonical: '/podbor-besedki' } };
}

export default function QuizPage() {
  const quiz = getQuiz();

  return (
    <Container className="page-section">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Подбор беседки', href: '/podbor-besedki' }]} />
      <h1 className="page-title mb-2">{quiz.title}</h1>
      <p className="mb-6 max-w-xl text-text-muted">{quiz.intro}</p>
      <QuizClient quiz={quiz} />
    </Container>
  );
}
