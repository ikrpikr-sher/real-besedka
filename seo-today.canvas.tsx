export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 27.08.2026 · будничный прогон</p>
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
            <strong>P1, владелец.</strong> Cloudflare NS уже lola+moura, но прокси выключен:
            A=31.128.44.47, нет cf-* headers. Origin отвечает 200 — это не авария сайта, нужен
            оранжевый cloud в кабинете CF.
          </li>
          <li>
            <strong>Блокер деплоя.</strong> В репозитории нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code> — <code>og:type=product</code> и noindex поиска на
            прод не выкатить.
          </li>
          <li>
            Карточки: товарный <code>og:image</code> уже есть, но <code>og:type=website</code>.
          </li>
          <li>
            Пустой <code>/katalog/poisk</code> без noindex и этот URL есть в sitemap (поиск с{" "}
            <code>?q=</code> — <code>noindex, follow</code>).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            На проде (вне этого репо): ContactPage, BreadcrumbList на /katalog, человекочитаемые H1
            категорий блога, товарный og:image, кириллица в 20 статьях.
          </li>
          <li>
            Агент больше не требует переписать 130 уникальных title и не ставит в backlog уже
            закрытые ContactPage / H1 slug.
          </li>
          <li>
            Health различает «нет фото в OG» и «нет og:type=product»; ловит битую кириллицу в блоге
            и служебный поиск в sitemap.
          </li>
          <li>Снят ложный warning «живой title сильнее layout», когда кода сайта нет в репо.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 190 URL · 130 карточек · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · emergency нет · CF proxy = P1 owner_action</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77</li>
          <li>SSL до 2026-11-22 · PageSpeed не запускался (не понедельник)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: оранжевое облако на A/www в Cloudflare, SSL Full (strict).</li>
          <li>Положить код сайта и SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики.</li>
          <li>
            После кода: <code>og:type=product</code>, убрать <code>/katalog/poisk</code> из sitemap,
            noindex на пустой поиск.
          </li>
        </ol>
      </section>
    </article>
  );
}
