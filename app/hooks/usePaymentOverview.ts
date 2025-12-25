import { useState, useEffect } from "react";
import { getPaymentOverview } from "~/services/overview";
import type { PaymentStatistics, OverviewParams } from "~/services/overview";

export const usePaymentOverview = (params: OverviewParams = {}) => {
  const [data, setData] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getPaymentOverview(params);
        if (response.success) {
          setData(response.data);
        } else {
          setError("Failed to fetch payment statistics");
        }
      } catch (err) {
        setError("An error occurred while fetching payment statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.time_range, params.branch_id]);

  return { data, loading, error };
};
