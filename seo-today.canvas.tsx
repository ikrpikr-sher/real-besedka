export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 28.08.2026 · будничный прогон</p>
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
            A=31.128.44.47, нет cf-* headers. Origin отвечает 200 — не авария сайта, нужно
            оранжевое облако в кабинете Cloudflare.
          </li>
          <li>
            <strong>Блокер деплоя.</strong> В репозитории нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code> — on-page на прод из этого прогона не выкатить.
          </li>
          <li>
            <strong>P2.</strong> Карточки: og:type=website, og:image = сайтный hero, не фото модели.
            Пустой <code>/katalog/poisk</code> в sitemap без noindex (<code>?q=</code> уже noindex).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Агент больше не ставит P1 «нет товарного OG», если og:image есть. type=website и общий
            hero — P2.
          </li>
          <li>
            Backlog не просит переписать 130 уникальных title, ContactPage, BreadcrumbList и H1
            категорий блога — на проде это уже закрыто.
          </li>
          <li>Снят ложный warning «живой title сильнее layout.tsx», когда кода сайта нет в репо.</li>
          <li>Weekday бьёт прод один раз за прогон, а не четыре.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 190 URL · 130 карточек · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10 · светофор «клиент может пользоваться»</li>
          <li>Health повторно: P0=0 · P1=1 · P2=2 · emergency нет</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77</li>
          <li>SSL до 2026-11-22 · PageSpeed не запускался (не понедельник)</li>
          <li>20 постов блога, H1 категорий человекочитаемые, ContactPage и BreadcrumbList на месте</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: оранжевое облако на A/www в Cloudflare, SSL Full (strict).</li>
          <li>Положить код сайта и SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики.</li>
          <li>
            После кода: og:type=product + товарный og:image; noindex пустого поиска и убрать его из
            sitemap.
          </li>
        </ol>
      </section>
    </article>
  );
}
