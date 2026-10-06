export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 06.10.2026 · будничный прогон</p>
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
            <strong>P1.</strong> Старый URL{" "}
            <code>/katalog/besedki-s-ostekleniem/b-51</code> отдаёт 404 без 301. Живая карточка —{" "}
            <code>/katalog/otkrytye-besedki/b-51</code> («Графит · Лофт»). Поиск B-51/В51 её находит.
          </li>
          <li>
            <strong>Блокер деплоя.</strong> Нет <code>besedki-seo/</code> и{" "}
            <code>~/.ssh/besedki_deploy</code> — 301 и on-page на прод не выкатить.
          </li>
          <li>
            P2: og:type=website при живом фото; сирота <code>/blog/category/sovety</code>; пустой{" "}
            <code>/katalog/poisk</code> в sitemap без noindex; 1943 статьи в карте; SKU 146 (было 172).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Backlog больше не понижает health P1 до P2: B-51 404 снова в очереди как P1.
          </li>
          <li>
            Re-apply honesty с PR 22 (one collect, alias P1, поиск по href карточки, SKU floor 160).
          </li>
          <li>
            На проде без регресса: ContactPage, BreadcrumbList, уникальные title, человекочитаемые H1
            категорий блога из sitemap, форма и телефон.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 2179 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 9/9 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · P1=1 · P2=5 · emergency нет</li>
          <li>iPhone UA главная 200, форма, tel:+74952555477, viewport, Metrika 111500128 в HTML</li>
          <li>NS Beget · origin 31.128.44.47 · SSL до 2026-11-22 · PageSpeed не запускался</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: код сайта + SSH-ключ, затем 301 старого B-51 на открытую карточку.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики.</li>
          <li>
            После кода: og:type=product; noindex/убрать пустой poisk; закрыть sovety; ужать блог в
            sitemap.
          </li>
        </ol>
      </section>
    </article>
  );
}
