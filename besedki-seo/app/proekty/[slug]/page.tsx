import { notFound, permanentRedirect } from 'next/navigation';
import { getCatalogItemBySlug, getCatalogItemUrl } from '@/lib/content';

type Props = { params: { slug: string } };

export default function LegacyProektRedirectPage({ params }: Props) {
  const item = getCatalogItemBySlug(params.slug);
  if (!item) notFound();
  permanentRedirect(getCatalogItemUrl(item));
}
