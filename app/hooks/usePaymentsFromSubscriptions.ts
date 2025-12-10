import { useEffect, useState } from 'react';
import { useAppSelector } from '~/store/hooks';
import { listPaymentsFromSubscriptions, type PaymentRow } from '~/services/subscriptions';

export function usePaymentsFromSubscriptions() {
  const { token } = useAppSelector((s) => (s as any).auth);
  const { items: branches } = useAppSelector((s) => (s as any).branches || { items: [] });
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    listPaymentsFromSubscriptions(token)
      .then((rows) => {
        if (!mounted) return;
        // Replace branch ids with names
        const mapped = rows.map((r) => {
          const found = Array.isArray(branches) ? branches.find((b: any) => b.id === r.branch) : null;
          return { ...r, branch: found?.name || r.branch };
        });
        setItems(mapped);
      })
      .catch((e) => { if (mounted) setError(String(e.message || e)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token, branches]);

  return { items, loading, error };
}