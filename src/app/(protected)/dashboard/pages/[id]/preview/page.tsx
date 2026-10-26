import { PreviewScreen } from '@/components/dashboard/page';

export const metadata = { title: 'Preview · Dashboard' };

export default async function PreviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return <PreviewScreen id={id} />;
}
