import { useEffect, useState } from "react";
import { useAppSelector } from "~/store/hooks";
import { listStudentSubscriptions } from "~/services/subscriptions";
import { useAppDispatch } from "~/store/hooks";
import { setSubscriptions } from "~/store/subscriptionsSlice";
import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";

export function useStudentSubscriptions() {
  const { token } = useAppSelector((s) => s.auth as any);
  const { items: branches } = useAppSelector((s) => (s as any).branches || { items: [] });
  const dispatch = useAppDispatch();
  const cachedItems: SubscriptionItem[] = useAppSelector((s) => ((s as any).subscriptions?.items) || []);
  const [items, setItems] = useState<SubscriptionItem[]>(cachedItems);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    // Avoid refetch if we already have cached items
    const shouldFetch = !cachedItems || cachedItems.length === 0;
    (shouldFetch ? listStudentSubscriptions(token) : Promise.resolve(cachedItems))
      .then((data) => { if (mounted) {
        const mapped = data.map((it) => {
          const branchId = it.branch;
          const found = Array.isArray(branches) ? branches.find((b: any) => b.id === branchId) : null;
          return { ...it, branch: found?.name || it.branch };
        });
        dispatch(setSubscriptions(mapped));
        setItems(mapped);
      } })
      .catch((e) => { if (mounted) setError(String(e.message || e)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token, branches]);

  return { items, loading, error, refresh: async () => {
    setLoading(true);
    try {
      const data = await listStudentSubscriptions(token);
      const mapped = data.map((it) => {
        const branchId = it.branch;
        const found = Array.isArray(branches) ? branches.find((b: any) => b.id === branchId) : null;
        return { ...it, branch: found?.name || it.branch };
      });
      dispatch(setSubscriptions(mapped));
      setItems(mapped);
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }};
}