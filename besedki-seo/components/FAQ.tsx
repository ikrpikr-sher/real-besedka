export type FaqItem = { question: string; answer: string };

export default function FAQ({ items }: { items: FaqItem[] }) {
  if (!items?.length) return null;
  return (
    <section aria-labelledby="faq-heading" className="mt-10">
      <h2 id="faq-heading" className="mb-4 font-heading text-2xl">
        Частые вопросы
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details key={item.question} className="card">
            <summary className="cursor-pointer font-medium text-text">{item.question}</summary>
            <p className="mt-2 text-sm text-text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
