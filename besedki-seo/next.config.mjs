/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Staging dir for zero-downtime deploy: NEXT_DIST_DIR=.next-staging npm run build
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // ВАЖНО: output:'export' убран 2026-08-07 — с появлением /admin (пишет в JSON/MDX
  // на диске через API-роуты) сайт больше не может быть чисто статическим экспортом.
  // Хостинг — Node.js-приложение на Beget (не shared со статикой). См. CLAUDE.md.
  async redirects() {
    return [
      { source: '/katalog/zakrytye-besedki', destination: '/katalog/besedki-s-ostekleniem', permanent: true },
      { source: '/katalog/zakrytye-besedki/:path*', destination: '/katalog/besedki-s-ostekleniem/:path*', permanent: true },
      { source: '/katalog/pergoly', destination: '/katalog', permanent: true },
      { source: '/katalog/pergoly/:path*', destination: '/katalog', permanent: true },
      { source: '/katalog/hozbloki', destination: '/katalog', permanent: true },
      { source: '/katalog/hozbloki/:path*', destination: '/katalog', permanent: true },
      { source: '/katalog/drovniki', destination: '/katalog', permanent: true },
      { source: '/katalog/drovniki/:path*', destination: '/katalog', permanent: true },
      { source: '/katalog/bytovki', destination: '/katalog', permanent: true },
      { source: '/katalog/bytovki/:path*', destination: '/katalog', permanent: true },
      { source: '/katalog/mebel', destination: '/katalog', permanent: true },
      { source: '/katalog/mebel/:path*', destination: '/katalog', permanent: true },
      { source: '/katalog/ochagi', destination: '/katalog', permanent: true },
      { source: '/katalog/ochagi/:path*', destination: '/katalog', permanent: true },
      {
        source: '/katalog/besedki-s-ostekleniem/b-53',
        destination: '/katalog/besedki-osteklennye-loft/b-53',
        permanent: true,
      },
      {
        source: '/katalog/besedki-s-ostekleniem/b-51',
        destination: '/katalog/otkrytye-besedki/b-51',
        permanent: true,
      },
      {
        source: '/katalog/besedki-s-mangalom/b-51',
        destination: '/katalog/otkrytye-besedki/b-51',
        permanent: true,
      },
      { source: '/katalog/loft', destination: '/katalog/besedki-osteklennye-loft', permanent: true },
      {
        source: '/katalog/loft/:slug',
        destination: '/katalog/besedki-osteklennye-loft/:slug',
        permanent: true,
      },
      { source: '/loft', destination: '/besedka-loft', permanent: true },
      { source: '/panorama', destination: '/besedka-panorama', permanent: true },
      { source: '/zakrytaya', destination: '/zakrytaya-besedka', permanent: true },
      { source: '/zimnyaya', destination: '/zimnyaya-besedka', permanent: true },
      { source: '/otkrytaya', destination: '/otkrytaya-besedka', permanent: true },
      { source: '/steklo', destination: '/osteklennaya-besedka', permanent: true },
      { source: '/2x2', destination: '/besedka-2x2', permanent: true },
      { source: '/2x3', destination: '/besedka-2x3', permanent: true },
      { source: '/3x3', destination: '/besedka-3x3', permanent: true },
      { source: '/3x4', destination: '/besedka-3x4', permanent: true },
      { source: '/3х4', destination: '/besedka-3x4', permanent: true },
      { source: '/4x4', destination: '/besedka-4x4', permanent: true },
      { source: '/4x3', destination: '/besedka-4x3', permanent: true },
      { source: '/5x4', destination: '/besedka-5x4', permanent: true },
      { source: '/5x5', destination: '/besedka-5x5', permanent: true },
      { source: '/6x3', destination: '/besedka-6x3', permanent: true },
      { source: '/raschet', destination: '/#raschet', permanent: true },
      { source: '/besedka-3-na-3', destination: '/besedka-3x3', permanent: true },
      { source: '/besedka-3-na-4', destination: '/besedka-3x4', permanent: true },
      { source: '/besedka-4-na-4', destination: '/besedka-4x4', permanent: true },
      { source: '/besedka-4-na-3', destination: '/besedka-4x3', permanent: true },
      { source: '/besedka-2-na-2', destination: '/besedka-2x2', permanent: true },
      { source: '/besedka-2-na-3', destination: '/besedka-2x3', permanent: true },
      { source: '/besedka-6-na-3', destination: '/besedka-6x3', permanent: true },
      { source: '/metallicheskaya-besedka-kupit', destination: '/metallicheskaya-besedka', permanent: true },
      { source: '/besedka-metall', destination: '/besedka-iz-metalla', permanent: true },
      { source: '/besedka-metallicheskaya', destination: '/metallicheskaya-besedka', permanent: true },
      { source: '/besedki-iz-metalla', destination: '/besedka-iz-metalla', permanent: true },
      { source: '/besedka-kovanaya', destination: '/besedka-iz-metalla', permanent: true },
      { source: '/kovanaya-besedka', destination: '/besedka-iz-metalla', permanent: true },
      { source: '/naves-besedka', destination: '/besedka-naves', permanent: true },
      { source: '/besedka-na-naves', destination: '/besedka-naves', permanent: true },
      { source: '/besedka-s-grilom', destination: '/besedka-s-barbekyu', permanent: true },
      { source: '/besedka-gril', destination: '/besedka-s-barbekyu', permanent: true },
      { source: '/besedka-6-na-6', destination: '/besedka-6x6', permanent: true },
      { source: '/besedka-5-na-5', destination: '/besedka-5x5', permanent: true },
      { source: '/besedka-6-na-4', destination: '/besedka-6x4', permanent: true },
      { source: '/besedka-6x4-metra', destination: '/besedka-6x4', permanent: true },

    ];
  },
  images: {
    unoptimized: true,
    formats: ['image/webp'],
  },
};

export default nextConfig;
