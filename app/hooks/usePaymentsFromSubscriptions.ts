import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '~/store/hooks';
import { listPaymentsFromSubscriptions, type PaymentRow } from '~/services/subscriptions';
import { fetchBranchesThunk } from '~/store/branchesSlice';
import { setPayments } from '~/store/paymentsSlice';

export function usePaymentsFromSubscriptions() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => (s as any).auth);
  const { items: branches, loaded: branchesLoaded, loading: branchesLoading } = useAppSelector((s) => (s as any).branches || { items: [], loaded: false, loading: false });
  const paymentsState = useAppSelector((s) => (s as any).payments || { items: [], loaded: false });
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure branches are loaded so we can map ids to names
  useEffect(() => {
    if (!branchesLoaded && !branchesLoading) {
      dispatch(fetchBranchesThunk());
    }
  }, [branchesLoaded, branchesLoading, dispatch]);

  useEffect(() => {
    let mounted = true;
    // If payments already cached, hydrate local state and skip fetch
    if (paymentsState.loaded && Array.isArray(paymentsState.items) && paymentsState.items.length) {
      setItems(paymentsState.items as any);
      setLoading(false);
      setError(null);
      return () => { mounted = false; };
    }

    setLoading(true);
    setError(null);
    listPaymentsFromSubscriptions(token)
      .then((rows) => {
        if (!mounted) return;
        const mapped = rows.map((r) => {
          const found = Array.isArray(branches) ? branches.find((b: any) => b.id === r.branch) : null;
          return { ...r, branch: found?.name || r.branch };
        });
        setItems(mapped);
        // Cache normalized payments in Redux for future navigations
        dispatch(setPayments(mapped as any));
      })
      .catch((e) => { if (mounted) setError(String(e.message || e)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token, branches, paymentsState.loaded]);

  return { items, loading, error };
}