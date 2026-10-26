import type { Metadata } from 'next';

import ListSection from '@/components/blog/BlogListing';
import PageHero from '@/components/home/PageHero';

export const metadata: Metadata = {
  title: 'Insights',
  description:
    'Study strategies, concept explainers and exam guidance for IB, IGCSE, A Level, SAT, AP, JEE and NEET from the Zenith Learning mentors.',
  alternates: { canonical: '/blog' },
};

const Page = () => {
  return (
    <main>
      <PageHero
        eyebrow="Zenith Insights"
        title="Ideas that make hard concepts simple."
        description="Study strategies, concept explainers and exam guidance from our mentors."
      />
      <ListSection />
    </main>
  );
};

export default Page;
