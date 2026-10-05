export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 05.10.2026 · будничный прогон (понедельник)</p>
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
            <strong>P1.</strong> Старый URL B-51{" "}
            <code>/katalog/besedki-s-ostekleniem/b-51</code> отдаёт 404 без Location. Живая карточка —{" "}
            <code>/katalog/otkrytye-besedki/b-51</code> («Графит · Лофт»). Нужен 301; без{" "}
            <code>besedki-seo/</code> и SSH не выкатить.
          </li>
          <li>
            <strong>P2.</strong> SKU в sitemap 146 (02.10 было 172). Пустой{" "}
            <code>/katalog/poisk</code> в карте без noindex. Сирота{" "}
            <code>/blog/category/sovety</code>. 1943 статьи в sitemap. og:type=website при живом фото.
          </li>
          <li>
            <strong>Блокер деплоя.</strong> Нет <code>besedki-seo/</code> и{" "}
            <code>~/.ssh/besedki_deploy</code>. PageSpeed 429 без ключа.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            С main 25.08 снова накатили honesty из PR 21: one collect, SKU≠razmer/poisk, live
            backlog, порог 400 статей, first-hop 301.
          </li>
          <li>
            Агент больше не считает поиск «OK» из-за «B-51» в title: нужна ссылка на карточку.
          </li>
          <li>
            Health видит P1 на старый B-51 и P2 при SKU &lt; 160. Повторный health: P0=0 · P1=1 ·
            P2=5.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 → открытая B-51 · sitemap 2179 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10 · светофор «клиент может пользоваться»</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77</li>
          <li>SSL до 2026-11-22 · Beget NS · origin 31.128.44.47 · Метрика 111500128 в chunk</li>
          <li>PageSpeed: HTTP 429 без PAGESPEED_API_KEY</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Код сайта + SSH: 301 со старого B-51 и остальных снятых slug.</li>
          <li>Вернуть noindex пустому поиску, убрать его из sitemap; закрыть sovety.</li>
          <li>Сжать 1943 статьи в карте. og:type=product.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики. Ключ PageSpeed.</li>
        </ol>
      </section>
    </article>
  );
}
