import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';

import { PublicPage } from '@/components/public/page/PublicPage';
import { resolvePublicPath } from '@/features/page/api/publicPageApi';

/*
 * Single catch-all for every CMS page, at any depth: /a, /a/b, /a/b/c ...
 * Static routes (/dashboard, /about, /blog, ...) take precedence, so
 * they keep working; those names are also reserved in the backend.
 */

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const result = await resolvePublicPath(slug);

  if (!result || result.kind !== 'page') return {};

  const { seo } = result.view;
  const images = seo.openGraph.image ? [seo.openGraph.image] : undefined;

  return {
    title: seo.title,
    description: seo.description || undefined,
    keywords: seo.keywords.length > 0 ? seo.keywords : undefined,
    alternates: { canonical: seo.canonicalUrl },
    robots: {
      index: seo.robots.startsWith('index'),
      follow: seo.robots.endsWith('nofollow') ? false : true,
    },
    openGraph: {
      type: 'website',
      url: seo.openGraph.url,
      title: seo.openGraph.title,
      description: seo.openGraph.description || undefined,
      images,
    },
    twitter: {
      card: seo.twitter.card,
      title: seo.twitter.title,
      description: seo.twitter.description || undefined,
      images,
    },
  };
}

export default async function CmsPage(props: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await props.params;
  const result = await resolvePublicPath(slug);

  if (!result) notFound();

  if (result.kind === 'redirect') {
    // Mixed-case URLs go permanently to the lowercase one; folder redirects are temporary.
    const lowered = `/${slug.join('/')}`.toLowerCase();

    if (result.to === lowered && lowered !== `/${slug.join('/')}`) permanentRedirect(result.to);

    redirect(result.to);
  }

  return (
    <div className="bg-white text-slate-900">
      <PublicPage view={result.view} />
    </div>
  );
}
