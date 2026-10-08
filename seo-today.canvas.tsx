export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 08.10.2026 · четверг</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Клиент может открыть сайт, посмотреть товар и оставить заявку. Органика, индекс и
          заявки — недостаточно данных (нет Вебмастера / GSC / Метрики).
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сломано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>P1.</strong> Старые адреса B-51 по-прежнему 404 без 301:{" "}
            <code>/katalog/besedki-s-ostekleniem/b-51</code> и{" "}
            <code>/katalog/besedki-s-mangalom/b-51</code>. Живая карточка —{" "}
            <code>/katalog/otkrytye-besedki/b-51</code>. Редирект не выкатить: нет{" "}
            <code>besedki-seo/</code> и ключа <code>~/.ssh/besedki_deploy</code>.
          </li>
          <li>
            <strong>P2.</strong> В sitemap по-прежнему 1943 статьи. Пустой{" "}
            <code>/katalog/poisk</code> в карте без noindex. Сирота{" "}
            <code>/blog/category/sovety</code> открыта с H1 «sovety».
          </li>
          <li>
            <strong>P2.</strong> Хаб «беседка с мангалом»: в карте 39 SKU, в сетке 10 ссылок, в
            ItemList 20. Карточки b-76…b-94 сами открываются (200, уникальный title), но с хаба
            на них нет ссылки. На карточках og:type=website при живом фото.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Каталог в карте вырос: 2179 → 2200 URL, SKU 146 → 167. Порог 160 снят. Прирост — 21
            беседка «Огонь» b-74…b-94, все отдают 200.
          </li>
          <li>66 хабов и коммерческих посадочных — HTTP 200. Фанера и каркас 80×80 — 200.</li>
          <li>
            IndexNow: 89 приоритетных URL, включая 21 новую карточку. Яндекс ответил 200. Блог
            не отправлялся.
          </li>
          <li>P0 нет. Форма, телефон и поиск B-51 / В51 на живую карточку работают.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 2200 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · P1=2 · P2=4 · emergency нет</li>
          <li>SSL до 2026-11-22 (44 дня) · Метрика 111500128 в layout-чанке, не в сыром HTML</li>
          <li>PageSpeed не запускался (четверг). seoDescription: 0. Деплой не запускался</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Код сайта и SSH-ключ — иначе 301 B-51 и ссылки b-76…b-94 с хаба не выкатить.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики и ключ PageSpeed.</li>
          <li>
            После кода: og:type=product, noindex сироты и пустого поиска, ссылки серии «Огонь» на
            хабе мангала, сжать блог в sitemap.
          </li>
          <li>Продлить SSL до 22.11.2026.</li>
        </ol>
      </section>
    </article>
  );
}
