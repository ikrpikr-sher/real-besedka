'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { METRIKA_COUNTER_ID, persistAttribution } from '@/lib/marketing';

function skipPath(pathname: string | null) {
  if (!pathname) return true;
  return pathname.startsWith('/admin') || pathname.startsWith('/api');
}

function AnalyticsHits() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstHit = useRef(true);

  useEffect(() => {
    persistAttribution(window.location.search);
  }, []);

  useEffect(() => {
    if (skipPath(pathname)) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname || '/';
    if (firstHit.current) {
      firstHit.current = false;
      return;
    }
    if (typeof window.ym === 'function') {
      window.ym(METRIKA_COUNTER_ID, 'hit', url);
    }
  }, [pathname, searchParams]);

  return null;
}

export default function Analytics() {
  return (
    <>
      <Script id="yandex-metrika" strategy="lazyOnload">
        {`(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_COUNTER_ID}', 'ym');
ym(${METRIKA_COUNTER_ID}, 'init', {
  ssr: true,
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
  webvisor: false
});`}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsHits />
      </Suspense>
    </>
  );
}
