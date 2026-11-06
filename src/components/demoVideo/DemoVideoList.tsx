"use client";

import { useState } from "react";
import { useGetDemoVideosQuery } from "@/features/demoVideo/api/demoVideoApi";
import { CardSkeletons, EmptyState, PublicHero, PublicPager } from "@/components/public/PublicParts";

export default function DemoVideoList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useGetDemoVideosQuery({ page });
  return (
    <main className="bg-surface-muted">
      <PublicHero eyebrow="Free resources" title="See learning in action" text="Explore short demo lessons and revisit each idea with a written transcript." />
      <section aria-label="Demo video lessons" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {isLoading ? <CardSkeletons /> : isError ? <div role="alert"><EmptyState title="Couldn’t load demo videos" text="Please try again shortly." /><button onClick={() => refetch()} className="rounded-full bg-brand-start px-6 py-3 text-white">Try again</button></div> : !data?.data.length ? <EmptyState title="Demo lessons are on their way" text="Check back soon for new videos." /> : (
          <div className="grid gap-7 md:grid-cols-2">
            {data.data.map(video => (
              <article key={video._id} className="overflow-hidden rounded-3xl border border-line bg-white">
                <video controls playsInline preload="none" poster={video.posterUrl} className="aspect-video w-full bg-brand-start" aria-label={video.title}>
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-mid">{video.category?.name} · {video.durationSeconds} seconds</p>
                  <h2 className="mt-3 font-display text-2xl text-brand-start">{video.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-ink-muted">{video.description}</p>
                  {video.transcript && <details className="mt-4 border-t border-line pt-4"><summary className="cursor-pointer font-semibold text-brand-mid">Read lesson transcript</summary><p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-muted">{video.transcript}</p></details>}
                </div>
              </article>
            ))}
          </div>
        )}
        <PublicPager page={page} totalPages={data?.pagination.totalPages ?? 1} onPage={setPage} />
      </section>
    </main>
  );
}
