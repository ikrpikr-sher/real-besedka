export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 18.10.2026 · воскресный прогон</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Сайт открывается, карточка и заявка работают. Органика и индекс — недостаточно
          данных (нет Вебмастера / GSC / Метрики).
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сломано / блокирует правки</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Блокер деплоя.</strong> Нет <code>besedki-seo/</code> и{" "}
            <code>~/.ssh/besedki_deploy</code> — пилот seoDescription (макс. 3 карточки) и{" "}
            <code>deploy.sh</code> не запускались.
          </li>
          <li>
            <strong>P2.</strong> Карточки: og:image и JSON-LD Product есть, og:type=website.
          </li>
          <li>
            <strong>P2.</strong> В sitemap 2201 URL, из них ~800 городских шаблонов блога.
            IndexNow <code>/indexnow.txt</code> — 404. SSL до 2026-11-22 (34 дня).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сделано сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Weekday прогнан. Health больше не ставит P1 «нет товарного OG», если картинка
            есть, а тип website.
          </li>
          <li>
            Backlog не просит ContactPage, H1 категорий блога и BreadcrumbList на{" "}
            <code>/katalog</code> — это уже на проде.
          </li>
          <li>
            Добавлены P2: городские шаблоны, IndexNow 404, окно SSL. Ship-скрипт честно
            пишет skip без кода сайта.
          </li>
          <li>
            Появился <code>SEO-90-DAYS.md</code>. priceFrom и целый katalog.json не
            трогались.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода 18.10</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Хабы и 6 коммерческих посадочных — 200. Поиск B-51 / В51 — 200.</li>
          <li>
            Карточки b-67 / b-60 / b-18: og:image ✓ · Product JSON-LD ✓ · og:type=website
          </li>
          <li>
            <code>/proekty</code> → 301 /katalog · ContactPage ✓ · H1 «Сравнения» ✓
          </li>
          <li>Sitemap 2201 · SSL 34 дня · PageSpeed не запускался (не понедельник)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: код сайта + SSH в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики.</li>
          <li>IndexNow ключ, продление SSL до 22.11, затем og:type=product.</li>
        </ol>
      </section>
    </article>
  );
}
