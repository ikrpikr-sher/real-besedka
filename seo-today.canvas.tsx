export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 07.10.2026 · среда</p>
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
            <strong>P1.</strong> Старые адреса B-51 отдают 404 без 301:{" "}
            <code>/katalog/besedki-s-ostekleniem/b-51</code> и{" "}
            <code>/katalog/besedki-s-mangalom/b-51</code>. Живая карточка —{" "}
            <code>/katalog/otkrytye-besedki/b-51</code>, поиск её находит. Редирект не выкатить:
            нет <code>besedki-seo/</code> и ключа <code>~/.ssh/besedki_deploy</code>.
          </li>
          <li>
            <strong>P2.</strong> В sitemap 1943 статьи при 146 карточках. Пустой{" "}
            <code>/katalog/poisk</code> в карте без noindex. Сирота{" "}
            <code>/blog/category/sovety</code> открыта с H1 «sovety».
          </li>
          <li>
            <strong>P2.</strong> На хабе «беседка с мангалом» в сетке 10 ссылок, в ItemList 18.
            Карточки b-64…b-72 сами открываются (200). На карточках og:type=website при живом
            фото.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Health видит оба старых URL B-51 как P1 и не понижает их до P2 в backlog.</li>
          <li>Поиск B-51 / В51 считается успехом только если в выдаче есть href карточки.</li>
          <li>52 хаба и коммерческих URL металла, размера и заказа — HTTP 200.</li>
          <li>IndexNow: 49 приоритетных URL, Яндекс ответил 202. Массовый блог не отправлялся.</li>
          <li>Состав карты не изменился: 2179 URL, SKU 146, статьи 1943, коммерческие 55.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 2179 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 9/9 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · P1=2 · P2=5 · emergency нет</li>
          <li>SSL до 2026-11-22 · Метрика 111500128 в layout-чанке, не в сыром HTML</li>
          <li>PageSpeed не запускался (среда). seoDescription: 0. Деплой не запускался</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Код сайта и SSH-ключ — иначе 301 B-51 и on-page на прод не выкатить.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики и ключ PageSpeed.</li>
          <li>После кода: og:type=product, noindex сироты и пустого поиска, ссылки b-64…b-72 на хабе мангала, сжать блог в sitemap.</li>
          <li>Продлить SSL до 22.11.2026.</li>
        </ol>
      </section>
    </article>
  );
}
