type PaymentItem = {
  title: string;
  description: string;
};

type Props = {
  title: string;
  intro?: string;
  items: PaymentItem[];
  compact?: boolean;
  id?: string;
};

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 6h18v12H3V6zm2 2v8h14V8H5zm2 2h6v1H7v-1zm0 2h4v1H7v-1z"
      />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 7h11v2H9.4l1.3 1.3-1.4 1.4L5.6 9 9.3 5.3l1.4 1.4L9.4 8H7zm10 10H6v-2h8.6l-1.3-1.3 1.4-1.4L18.4 15 14.7 18.7l-1.4-1.4 1.3-1.3H17z"
      />
    </svg>
  );
}

function LegalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 3h16v2H4V3zm1 4h14v14H5V7zm2 2v2h10V9H7zm0 4v2h10v-2H7zm0 4v2h6v-2H7z"
      />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4v2h16V8H4zm0 4v6h16v-6H4z"
      />
    </svg>
  );
}

const ICONS = [CashIcon, TransferIcon, LegalIcon, CardIcon] as const;

export default function PaymentMethods({ title, intro, items, compact = false, id }: Props) {
  return (
    <section id={id} aria-label={title} className={compact ? 'space-y-3' : 'space-y-4'}>
      <div>
        <h2 className={compact ? 'font-heading text-lg' : 'font-heading text-2xl'}>{title}</h2>
        {intro ? <p className="mt-2 max-w-2xl text-sm text-text-muted">{intro}</p> : null}
      </div>
      <ul className={`grid list-none gap-3 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <li key={item.title} className="card h-full">
              <Icon />
              <h3 className="mt-2 font-heading text-base leading-snug">{item.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{item.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
