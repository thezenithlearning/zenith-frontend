import { NodeEditorScreen } from '@/components/dashboard/page';

export const metadata = { title: 'Edit page · Dashboard' };

export default async function EditPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return <NodeEditorScreen id={id} />;
}
