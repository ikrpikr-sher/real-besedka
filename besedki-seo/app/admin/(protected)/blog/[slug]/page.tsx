import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/blog';
import PostForm from '@/components/admin/PostForm';

export default function EditPostPage({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = getPostBySlug(params.slug);
  } catch {
    notFound();
  }
  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl">Редактировать: {post.title}</h1>
      <PostForm initial={post} />
    </div>
  );
}
