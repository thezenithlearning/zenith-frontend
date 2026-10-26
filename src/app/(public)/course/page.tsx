import type { Metadata } from 'next';

import ListSection from '@/components/course/CourseList';
import PageHero from '@/components/home/PageHero';

export const metadata: Metadata = {
  title: 'Programs',
  description:
    'Explore Zenith Learning programs: IB DP Physics, IGCSE & A Level, SAT & AP, JEE, NEET and CBSE.',
  alternates: { canonical: '/course' },
};

const page = () => {
  return (
    <div>
      <PageHero
        eyebrow="Programs"
        title="One platform. Multiple pathways."
        description="Choose the academic pathway that matches the student's curriculum and long-term goals."
      />
      <ListSection />
    </div>
  );
};

export default page;
