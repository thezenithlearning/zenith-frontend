import { useCallback } from 'react';
import {
  useBulkPageNodesMutation,
  useCreatePageNodeMutation,
  useDeletePageNodeMutation,
  useDuplicatePageNodeMutation,
  useLazyGetPageImpactQuery,
  useLazyGetPageNodeQuery,
  useMovePageNodeMutation,
  useReorderPageNodesMutation,
  useUpdatePageNodeMutation,
} from '../api/pageApi';
import type { BulkAction, CreateNodePayload, NodeInput } from '../types';

/**
 * Imperative page actions. Each call resolves with the result or throws the
 * RTK Query error (display it with getApiErrorMessage).
 */
export const usePageActions = () => {
  const [create] = useCreatePageNodeMutation();
  const [update] = useUpdatePageNodeMutation();
  const [move] = useMovePageNodeMutation();
  const [reorder] = useReorderPageNodesMutation();
  const [duplicate] = useDuplicatePageNodeMutation();
  const [remove] = useDeletePageNodeMutation();
  const [bulk] = useBulkPageNodesMutation();
  const [fetchImpact] = useLazyGetPageImpactQuery();
  const [fetchNode] = useLazyGetPageNodeQuery();

  return {
    createNode: useCallback((payload: CreateNodePayload) => create(payload).unwrap(), [create]),
    updateNode: useCallback(
      (id: string, body: Partial<NodeInput>) => update({ id, body }).unwrap(),
      [update],
    ),
    moveNode: useCallback(
      (id: string, parentId: string | null) => move({ id, parentId }).unwrap(),
      [move],
    ),
    reorderNodes: useCallback(
      (parentId: string | null, orderedIds: string[]) => reorder({ parentId, orderedIds }).unwrap(),
      [reorder],
    ),
    duplicateNode: useCallback((id: string) => duplicate(id).unwrap(), [duplicate]),
    deleteNode: useCallback(
      (id: string, cascade: boolean) => remove({ id, cascade }).unwrap(),
      [remove],
    ),
    bulkNodes: useCallback(
      (action: BulkAction, ids: string[], cascade = false) =>
        bulk({ action, ids, cascade }).unwrap(),
      [bulk],
    ),
    getImpact: useCallback((id: string) => fetchImpact(id, false).unwrap(), [fetchImpact]),
    getNode: useCallback((id: string) => fetchNode(id, false).unwrap(), [fetchNode]),
  };
};
