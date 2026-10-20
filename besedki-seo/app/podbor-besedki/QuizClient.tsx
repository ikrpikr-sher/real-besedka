'use client';

import { useState } from 'react';
import LeadForm from '@/components/LeadForm';
import type { QuizConfig } from '@/lib/content';

type Props = {
  quiz: QuizConfig;
};

export default function QuizClient({ quiz }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = step >= quiz.questions.length;

  function answer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setStep((s) => s + 1);
  }

  if (done) {
    return (
      <div className="max-w-lg space-y-4">
        <div className="card">
          <h2 className="font-heading text-xl">{quiz.resultCta.title}</h2>
          <p className="mt-1 text-sm text-text-muted">{quiz.resultCta.text}</p>
        </div>
        <LeadForm context={`Квиз: ${JSON.stringify(answers)}`} />
      </div>
    );
  }

  const question = quiz.questions[step];

  return (
    <div className="max-w-lg">
      <p className="mb-2 text-sm text-text-muted">
        Вопрос {step + 1} из {quiz.questions.length}
      </p>
      <div className="card">
        <h2 className="font-heading text-lg">{question.question}</h2>
        <div className="mt-4 space-y-2">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => answer(question.id, option)}
              className="btn-secondary w-full justify-start"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
