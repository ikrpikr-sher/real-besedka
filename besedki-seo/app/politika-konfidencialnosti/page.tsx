import type { Metadata } from 'next';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getSite } from '@/lib/content';
import { getSeo } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const site = getSite();
  const seo = getSeo('/politika-konfidencialnosti', {
    title: 'Политика обработки персональных данных',
    description:
      'Политика обработки персональных данных ' + site.legalName + ' — правила сбора, хранения и использования данных пользователей сайта.',
  });
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: '/politika-konfidencialnosti' },
    robots: { index: true, follow: true },
  };
}

export default function PrivacyPolicyPage() {
  const site = getSite();

  return (
    <Container className="page-section">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Политика конфиденциальности', href: '/politika-konfidencialnosti' },
        ]}
      />
      <h1 className="page-title mb-6">Политика обработки персональных данных</h1>

      <div className="prose max-w-none space-y-6 text-sm leading-relaxed text-text">
        <p className="text-text-muted">
          Действует в отношении всей информации, которую сайт {site.siteUrl.replace('https://', '')} может получить о пользователе во
          время использования сайта, программ и продуктов {site.legalName}.
        </p>

        <section>
          <h2 className="mb-2 font-heading text-xl">1. Оператор персональных данных</h2>
          <p>
            Оператором персональных данных, обрабатываемых на сайте, является {site.legalName}, ИНН {site.inn}, КПП {site.kpp},
            адрес: {site.address.streetAddress}, {site.address.addressLocality}.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">2. Правовые основания</h2>
          <p>
            Обработка персональных данных осуществляется в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных
            данных» и с согласия субъекта персональных данных на обработку его персональных данных.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">3. Какие данные собираются</h2>
          <p>При заполнении форм заявки на сайте (в том числе форм «Оставить заявку», квиза «Подбор беседки») оператор собирает:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>имя;</li>
            <li>номер телефона;</li>
            <li>комментарий к заявке (если указан пользователем);</li>
            <li>обезличенные технические данные (файлы cookie, IP-адрес, данные о браузере и устройстве) — для аналитики и корректной работы сайта.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">4. Цели обработки</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>обратная связь с пользователем по оставленной заявке, консультация по проектированию, изготовлению и монтажу беседок;</li>
            <li>подготовка коммерческого предложения и расчёта стоимости;</li>
            <li>улучшение качества работы сайта, удобства использования;</li>
            <li>проведение статистических и аналитических исследований на основе обезличенных данных.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">5. Условия обработки и передачи третьим лицам</h2>
          <p>
            Оператор не передаёт полученные персональные данные третьим лицам, за исключением случаев, прямо предусмотренных
            законодательством РФ (по запросу уполномоченных государственных органов), а также случаев, когда передача необходима для
            исполнения заявки пользователя (например, подрядчику для выезда на замер) — с уведомлением пользователя.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">6. Срок хранения данных</h2>
          <p>
            Персональные данные хранятся не дольше срока, необходимого для целей их обработки, если иной срок не установлен договором
            или законодательством РФ, после чего подлежат удалению или обезличиванию.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">7. Права пользователя</h2>
          <p>Пользователь вправе в любой момент:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>отозвать согласие на обработку персональных данных;</li>
            <li>запросить информацию о своих обрабатываемых персональных данных;</li>
            <li>потребовать уточнения, блокировки или уничтожения своих персональных данных, если они неполны, устарели, неточны или незаконно получены.</li>
          </ul>
          <p className="mt-2">
            Для реализации этих прав можно обратиться по телефону {site.phone} или на email {site.email}.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">8. Файлы cookie</h2>
          <p>
            Сайт использует файлы cookie для корректной работы, аналитики посещаемости и улучшения пользовательского опыта.
            Продолжая использовать сайт, пользователь соглашается с использованием файлов cookie. Отключить cookie можно в настройках
            браузера — это может ограничить некоторые функции сайта.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">9. Изменение политики</h2>
          <p>
            Оператор вправе вносить изменения в настоящую политику. Актуальная версия всегда доступна по адресу{' '}
            {site.siteUrl}/politika-konfidencialnosti.
          </p>
        </section>

        <p className="text-xs text-text-muted">Редакция от {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
      </div>
    </Container>
  );
}
