import CatalogCard from './CatalogCard';
import type { CatalogItem } from '@/lib/content';

export default function ProjectCard({
  project,
  priority = false,
}: {
  project: CatalogItem;
  priority?: boolean;
}) {
  return <CatalogCard item={project} priority={priority} />;
}
