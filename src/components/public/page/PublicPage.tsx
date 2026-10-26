import type { PublicPageView } from '@/features/page/types';

import { fragmentHtml } from './rawHtml';
import { RawSections } from './SectionRenderer';

/**
 * Renders a resolved page exactly as authored: no page wrapper, width,
 * padding, heading or typography styles. The author's own HTML/CSS is the
 * whole page. Used by the public route and the dashboard preview.
 */
export function PublicPage({ view }: { view: PublicPageView }) {
  if (view.sections.length > 0) return <RawSections sections={view.sections} />;

  return view.html ? <div dangerouslySetInnerHTML={{ __html: fragmentHtml(view.html) }} /> : null;
}
