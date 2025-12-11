import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "~/store/hooks";
import { listWorkerSubscriptions } from "~/services/subscriptions";
import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";
import { fetchBranchesThunk } from "~/store/branchesSlice";

export function useWorkerSubscriptions() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => (s as any).auth);
  const { items: branches, loaded: branchesLoaded, loading: branchesLoading } = useAppSelector((s) => (s as any).branches || { items: [], loaded: false, loading: false });
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure branches are loaded to map ids -> names
  useEffect(() => {
    if (!branchesLoaded && !branchesLoading) {
      dispatch(fetchBranchesThunk());
    }
  }, [branchesLoaded, branchesLoading, dispatch]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    listWorkerSubscriptions(token)
      .then((data) => {
        if (!mounted) return;
        const mapped = data.map((it) => {
          const branchId = it.branch;
          const found = Array.isArray(branches) ? branches.find((b: any) => b.id === branchId) : null;
          return { ...it, branch: found?.name || it.branch };
        });
        setItems(mapped);
      })
      .catch((e) => { if (mounted) setError(String(e.message || e)); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [token, branches]);

  return { items, loading, error };
}
