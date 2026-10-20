import Link from 'next/link';

const BLOCKS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Металл',
    links: [
      { href: '/besedka-iz-metalla', label: 'Из металла' },
      { href: '/metallicheskaya-besedka', label: 'Металлическая' },
      { href: '/metallicheskie-besedki', label: 'Металлические' },
      { href: '/besedka-iz-metalloprofilja', label: 'Из металлопрофиля' },
      { href: '/besedka-loft', label: 'Лофт' },
      { href: '/besedka-metall-ili-derevo', label: 'Металл или дерево' },
    ],
  },
  {
    title: 'Купить / тип',
    links: [
      { href: '/kupit-besedku', label: 'Купить' },
      { href: '/kupit-metallicheskuyu-besedku', label: 'Купить металлическую' },
      { href: '/besedka-pod-klyuch', label: 'Под ключ' },
      { href: '/otkrytaya-besedka', label: 'Открытая' },
      { href: '/zakrytaya-besedka', label: 'Закрытая' },
      { href: '/osteklennaya-besedka', label: 'Остеклённая' },
      { href: '/zimnyaya-besedka', label: 'Зимняя' },
    ],
  },
  {
    title: 'Размеры',
    links: [
      { href: '/besedka-2x2', label: '2×2' },
      { href: '/besedka-3x3', label: '3×3' },
      { href: '/besedka-3x4', label: '3×4' },
      { href: '/besedka-4x4', label: '4×4' },
      { href: '/besedka-5x5', label: '5×5' },
      { href: '/besedka-6x3', label: '6×3' },
      { href: '/besedka-6x6', label: '6×6' },
    ],
  },
  {
    title: 'Мангал / навес',
    links: [
      { href: '/besedka-s-mangalom-pod-klyuch', label: 'С мангалом' },
      { href: '/besedka-s-mangalnoy-zonoy', label: 'С мангальной зоной' },
      { href: '/besedka-s-barbekyu', label: 'С барбекю' },
      { href: '/barbekyu-zona', label: 'Барбекю-зона' },
      { href: '/mangalnaya-zona', label: 'Мангальная зона' },
      { href: '/besedka-naves', label: 'Беседка-навес' },
      { href: '/metallicheskiy-naves', label: 'Навес' },
    ],
  },
];

export default function CommerceHubNav({ current }: { current?: string }) {
  return (
    <nav className="mb-10 rounded-lg border border-border bg-surface p-4" aria-label="Коммерческие разделы">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Подобрать беседку</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BLOCKS.map((block) => (
          <div key={block.title}>
            <p className="mb-1.5 text-sm font-medium text-text">{block.title}</p>
            <ul className="space-y-1 text-sm text-text-muted">
              {block.links.map((link) => (
                <li key={link.href}>
                  {link.href === current ? (
                    <span className="text-text">{link.label}</span>
                  ) : (
                    <Link className="text-accent hover:underline" href={link.href}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-text-muted">
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/proizvoditel-besedok">
          Производитель
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/dostavka-i-montazh">
          Доставка и монтаж
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedki-moskva">
          Москва
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog">
          Каталог
        </Link>
      </p>
    </nav>
  );
}
