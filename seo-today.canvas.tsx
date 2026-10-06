export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 06.10.2026 · вторник</p>
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
            <strong>Блокер деплоя.</strong> В репозитории нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code>. <code>seoDescription</code> и деплой сегодня не
            делались.
          </li>
          <li>
            <strong>P2.</strong> В sitemap 1943 статьи при 146 карточках. Пустой{" "}
            <code>/katalog/poisk</code> в карте без noindex. Сирота{" "}
            <code>/blog/category/sovety</code> открыта с H1 «sovety».
          </li>
          <li>
            <strong>P2.</strong> На карточках есть фото в og:image, но og:type=website. SKU с 05.10
            не менялись: 146 и в карте, и на хабах категорий.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Агент снова отличает живое фото модели от отсутствующего og:image. Health: P0=0, P1=0.</li>
          <li>44 хаба и коммерческих URL металла, размера и заказа — HTTP 200.</li>
          <li>IndexNow: 44 приоритетных URL, Яндекс ответил 200. Массовый блог не отправлялся.</li>
          <li>NS Beget, origin 200. Cloudflare не открывался как авария.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 2179 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 8/8 · светофор «клиент может пользоваться»</li>
          <li>Состав карты: SKU 146 · статьи 1943 · коммерческие посадочные 55</li>
          <li>SSL до 2026-11-22 · Метрика 111500128 в HTML главной</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Код сайта и SSH-ключ — иначе on-page на прод не выкатить.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики и ключ PageSpeed.</li>
          <li>После кода: og:type=product, noindex сироты и пустого поиска, сжать блог в sitemap.</li>
          <li>Продлить SSL до 22.11.2026.</li>
        </ol>
      </section>
    </article>
  );
}
