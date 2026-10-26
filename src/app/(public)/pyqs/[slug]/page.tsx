import type { Metadata } from 'next';
import PyqDetail from '@/components/pyq/PyqDetail';
import { fetchPublic } from '@/lib/serverApi';

interface PyqMeta {
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}

const plain = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pyq = await fetchPublic<PyqMeta>(`/pyqs/slug/${encodeURIComponent(slug)}`);
  if (!pyq) return { title: 'PYQ', robots: { index: false } };
  return {
    title: pyq.seoTitle || pyq.title,
    description: pyq.seoDescription || plain(pyq.description) || `Download ${pyq.title} PDF.`,
    keywords: pyq.keywords?.length ? pyq.keywords : undefined,
    alternates: { canonical: `/pyqs/${slug}` },
  };
}

export default async function PyqPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PyqDetail slug={slug} />;
}
