import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "~/store/hooks";
import { fetchSubscriptions } from "~/store/subscriptionsSlice";

export function useStudentSubscriptions() {
  const { token } = useAppSelector((s) => s.auth as any);
  const { items, loading, error, hydrated } = useAppSelector((s: any) => s.subscriptions || { items: [], loading: false, error: null, hydrated: false });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!hydrated) {
      dispatch(fetchSubscriptions({ token }));
    }
  }, [hydrated, token, dispatch]);

  return { items, loading, error };
}