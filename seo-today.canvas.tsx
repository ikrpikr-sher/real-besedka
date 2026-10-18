export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 18.10.2026 · воскресенье</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Сайт открывается, товар с фото смотрится, заявка и телефон на месте. Хабы из sitemap
          отвечают 200. Органика и индекс — недостаточно данных: нет Вебмастера, GSC и Метрики.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сломано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Блокер деплоя.</strong> В среде нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code>. На прод сегодня ничего не выкатывалось.
          </li>
          <li>
            <strong>P2.</strong> На карточках <code>og:type=website</code>, хотя <code>og:image</code> и
            JSON-LD Product есть. Тип не сменить без кода сайта.
          </li>
          <li>
            <code>/materialy/fanera-pol</code> и <code>/materialy/metall-karkas</code> без
            BreadcrumbList.
          </li>
          <li>
            IndexNow: <code>/indexnow.txt</code> отвечает 404, ключа нет — приоритетные URL не
            пинговались.
          </li>
          <li>SSL до 2026-11-22 (34 дня). Автопродление не проверено: нет SSH.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что проверено</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Weekday exit 0. Health после правки классификатора: P0=0, P1=0, P2=1.</li>
          <li>Маршруты 7/7, поиск B-51 и В51, карточки 10/10, hero 10/10, GLB 10/10.</li>
          <li>84 хаба и коммерческих URL из sitemap — все 200.</li>
          <li>Sitemap 2201 URL: 167 карточек и около 1945 статей блога.</li>
          <li>NS Beget, A 31.128.44.47. Пункт про Cloudflare снят.</li>
          <li>
            ContactPage, человеческий H1 категории «Сравнения», хлебные крошки каталога — на проде
            есть.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Код сайта и SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастера, GSC и целей Метрики.</li>
          <li>Ключ IndexNow, если нужен обход коммерческих URL.</li>
          <li>800 городских шаблонов блога не трогать вслепую: индекс по ним неизвестен.</li>
        </ol>
      </section>
    </article>
  );
}
