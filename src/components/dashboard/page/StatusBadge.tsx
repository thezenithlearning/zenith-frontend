import { EyeOff, FileText, Folder, FolderOpen, Search, type LucideIcon } from 'lucide-react';

import type { NodeStatus, NodeType, IPageNode } from '@/features/page/types';

const base = 'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium';

const statusStyles: Record<NodeStatus, string> = {
  published: 'bg-green-50 text-green-700 ',
  draft: 'bg-amber-50 text-amber-700 ',
  archived: 'bg-gray-200 text-gray-600 ',
};

export function StatusBadge({ node }: { node: Pick<IPageNode, 'status' | 'isLive'> }) {
  // A "published" node outside its schedule is not actually public.
  const scheduled = node.status === 'published' && !node.isLive;

  return (
    <span className={`${base} ${scheduled ? statusStyles.draft : statusStyles[node.status]}`}>
      {scheduled ? 'Scheduled / expired' : node.status}
    </span>
  );
}

const neutral = `${base} bg-gray-50 text-gray-600 `;

/** Navigation / indexing flags. Text + icon, so colour is never the only cue. */
export function FlagBadges({ node }: { node: Pick<IPageNode, 'navigation' | 'seo'> }) {
  return (
    <>
      {!node.navigation.showInNavigation && (
        <span className={neutral} title="Hidden from navigation menus">
          <EyeOff className="h-3 w-3" />
          Hidden in nav
        </span>
      )}
      {!node.seo.robotsIndex && (
        <span className={neutral} title="Search engines are told not to index this page">
          <Search className="h-3 w-3" />
          Noindex
        </span>
      )}
    </>
  );
}

export function NodeIcon({
  type,
  open = false,
  className = 'h-4 w-4',
}: {
  type: NodeType;
  open?: boolean;
  className?: string;
}) {
  const Icon: LucideIcon = type === 'folder' ? (open ? FolderOpen : Folder) : FileText;

  return (
    <Icon
      className={`${className} shrink-0 ${type === 'folder' ? 'text-amber-700' : 'text-indigo-700'}`}
      aria-hidden="true"
    />
  );
}
