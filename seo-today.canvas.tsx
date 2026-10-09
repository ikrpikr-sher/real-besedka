export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 09.10.2026 · будничный прогон</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Клиент может открыть сайт, посмотреть товар и оставить заявку. Органика и индекс —
          недостаточно данных (нет Вебмастера / GSC / Метрики).
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сломано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>P1.</strong> Старые URL B-51{" "}
            <code>/katalog/besedki-s-ostekleniem/b-51</code> и{" "}
            <code>/katalog/besedki-s-mangalom/b-51</code> отдают 404 без 301 на живую{" "}
            <code>/katalog/otkrytye-besedki/b-51</code> («Графит · Лофт»).
          </li>
          <li>
            <strong>P1.</strong> Категория лофт переехала: живой{" "}
            <code>/katalog/besedki-osteklennye-loft</code> + b-53/54/55/62/63. Старые{" "}
            <code>/katalog/loft</code> и те же slug — 404 без Location.
          </li>
          <li>
            <strong>Блокер деплоя.</strong> В репозитории нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code> — 301 на прод не выкатить.
          </li>
          <li>
            P2: <code>og:type=website</code> при живом фото; сирота{" "}
            <code>/blog/category/sovety</code>; пустой <code>/katalog/poisk</code> в sitemap без
            noindex; 1943 статьи в карте.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Повторно наложены honesty-правки (PR 28): один collect, живой OG/H1, B-51 aliases,
            переезд лофт, состав sitemap, приоритет health в backlog.
          </li>
          <li>
            Health теперь предупреждает про SSL заранее: P2 если меньше 30 дней, P1 если меньше 21.
            Сейчас 44 дня до 22.11 — тихо.
          </li>
          <li>Прод без регресса к 08.10: SKU 167, sitemap 2200, P0=0, светофор зелёный.</li>
          <li>ContactPage, BreadcrumbList, уникальные title, человеческие H1 категорий блога — живы.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 (href живой карточки) · sitemap 2200 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · P1=3 · P2=4 · emergency нет</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77 · Метрика 111500128 в layout</li>
          <li>NS Beget · origin 31.128.44.47 · SSL до 2026-11-22 · PageSpeed не запускался</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: код сайта + SSH-ключ в среду агента.</li>
          <li>301 старых B-51 и /katalog/loft* на новые URL.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики.</li>
          <li>
            После кода: og:type=product; noindex пустого поиска и sovety; ужать 1943 статьи в
            sitemap.
          </li>
        </ol>
      </section>
    </article>
  );
}
