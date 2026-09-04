export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 04.09.2026 · будничный прогон</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Клиент может открыть сайт, посмотреть товар и оставить заявку. P0=0 · P1=0 · P2=4.
          Органика и индекс — недостаточно данных (нет Вебмастера / GSC / Метрики).
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сломано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Блокер деплоя.</strong> В репозитории нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code> — P2 on-page на прод не выкатить.
          </li>
          <li>
            <strong>P2.</strong> Карточки: og:image = фото модели, но <code>og:type=website</code> (лучше{" "}
            <code>product</code>).
          </li>
          <li>
            <strong>P2.</strong> Пустой <code>/katalog/poisk</code> в sitemap без noindex; 264 URL тегов
            блога в карте (sitemap 591, без изменений к 03.09).
          </li>
          <li>
            <strong>P2.</strong> Сирота <code>/blog/category/sovety</code>: 200, title/H1 «sovety», без
            noindex, нет в sitemap.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            На main снова накатились правки агента из незамерженных PR 3–9: нет og:image = P1,
            type=website + фото = P2; backlog не открывает закрытые live-пункты; weekday — один
            collect; sitemap P2 (poisk / теги); analyzer без layout.tsx, если нет кода сайта.
          </li>
          <li>
            Агент больше не пропускает H1-slug: проверяет все 5 категорий из sitemap и bare slug
            («sovety», не только «Категория: sovety»). Сирота sovety попала в backlog.
          </li>
          <li>
            Пять категорий в карте с человеческими H1 («Монтаж и уход», «Сравнения», «Проекты и
            идеи», «Стили», «Как выбрать»). ContactPage, BreadcrumbList, уникальные title — закрыты.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 591 URL · 0/20 ошибок</li>
          <li>141 карточка · 153 статьи · 264 тега · 5 категорий блога</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 9/9 · светофор «клиент может пользоваться»</li>
          <li>Health weekday: P0=0 · P1=0 · P2=3 · плюс сирота sovety после сверки</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77</li>
          <li>NS Beget · origin 31.128.44.47 · SSL до 2026-11-22 · PSI не запускался (не пн)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: код сайта + SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики. Яндекс Бизнес / GBP.</li>
          <li>
            После кода: <code>og:type=product</code>; noindex пустого поиска и убрать из sitemap; теги
            блога — noindex или выкинуть из карты; 301/noindex для <code>/blog/category/sovety</code>.
          </li>
        </ol>
      </section>
    </article>
  );
}
