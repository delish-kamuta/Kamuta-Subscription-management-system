import { useState, useEffect } from "react";
import { getSubscriptionOverview } from "~/services/overview";
import type { SubscriptionStatistics, OverviewParams } from "~/services/overview";

export const useSubscriptionOverview = (params: OverviewParams = {}) => {
  const [data, setData] = useState<SubscriptionStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getSubscriptionOverview(params);
        if (response.success) {
          setData(response.data);
        } else {
          setError("Failed to fetch subscription statistics");
        }
      } catch (err) {
        setError("An error occurred while fetching subscription statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.time_range, params.branch_id]);

  return { data, loading, error };
};
