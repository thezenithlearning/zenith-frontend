import type { Metadata } from 'next';
import QuizPlayer from '@/components/mock-tests/QuizPlayer';
import { fetchPublic } from '@/lib/serverApi';

interface QuizMeta {
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await fetchPublic<QuizMeta>(`/quizzes/slug/${encodeURIComponent(slug)}`);
  if (!quiz) return { title: 'Mock Test', robots: { index: false } };
  return {
    title: quiz.seoTitle || quiz.title,
    description: quiz.seoDescription || quiz.description || `Attempt the ${quiz.title} mock test online.`,
    alternates: { canonical: `/mock-tests/${slug}` },
  };
}

export default async function MockTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <QuizPlayer slug={slug} />;
}
