import CatalogCategoryNav from '@/components/CatalogCategoryNav';

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CatalogCategoryNav />
      {children}
    </>
  );
}
