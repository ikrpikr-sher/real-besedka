import NavLink from '@/components/NavLink';

const LINKS: { href: string; label: string }[] = [
  { href: '/besedka-3x4', label: 'Беседка 3×4' },
  { href: '/besedka-4x4', label: 'Беседка 4×4' },
  { href: '/besedka-3x3', label: 'Беседка 3×3' },
  { href: '/besedka-2x3', label: 'Беседка 2×3' },
  { href: '/besedka-2x2', label: 'Беседка 2×2' },
  { href: '/besedka-6x3', label: 'Беседка 6×3' },
  { href: '/shestigrannaya-besedka', label: 'Шестигранные' },
  { href: '/besedka-dlya-dachi', label: 'Для дачи' },
  { href: '/besedka-panorama', label: 'Панорама' },
  { href: '/mangalnaya-zona', label: 'Мангальные зоны' },
  { href: '/sadovye-kacheli', label: 'Качели' },
  { href: '/zakazat-besedku', label: 'Заказать' },
  { href: '/besedka-iz-metalla', label: 'Из металла' },
  { href: '/metallicheskie-besedki', label: 'Металлические' },
  { href: '/besedka-iz-metalloprofilja', label: 'Из металлопрофиля' },
  { href: '/besedka-metall-ili-derevo', label: 'Металл или дерево' },
  { href: '/metallicheskaya-besedka', label: 'Металлическая' },
  { href: '/kupit-besedku', label: 'Купить беседку' },
  { href: '/besedki-moskva', label: 'Беседки Москва' },
  { href: '/besedka-s-mangalnoy-zonoy', label: 'С мангальной зоной' },
  { href: '/besedka-s-barbekyu', label: 'С барбекю' },
  { href: '/besedka-naves', label: 'Беседка-навес' },
  { href: '/besedka-6x6', label: 'Беседка 6×6' },
  { href: '/besedka-5x5', label: 'Беседка 5×5' },
  { href: '/besedka-medvedi', label: 'Медведи' },
  { href: '/besedka-oleni', label: 'Олени' },
  { href: '/otkrytaya-besedka', label: 'Открытые' },
  { href: '/zakrytaya-besedka', label: 'Закрытые' },
  { href: '/zimnyaya-besedka', label: 'Зимние' },
  { href: '/besedka-loft', label: 'Лофт' },
  { href: '/osteklennaya-besedka', label: 'Остеклённые' },
  { href: '/besedka-s-mangalom-pod-klyuch', label: 'С мангалом' },
  { href: '/besedka-pod-klyuch', label: 'Под ключ' },
  { href: '/metallicheskiy-naves', label: 'Навесы' },
  { href: '/tseny-na-besedki', label: 'Цены' },
  { href: '/kupit-metallicheskuyu-besedku', label: 'Купить' },
];

export default function HomeSeoLinks() {
  return (
    <nav className="mt-10 border-t border-border/80 pt-6" aria-label="Популярные разделы">
      <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
        Ещё по теме
      </p>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[13px] leading-relaxed text-text-muted/90">
        {LINKS.map((item) => (
          <NavLink key={item.href} href={item.href} className="hover:text-accent">
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
