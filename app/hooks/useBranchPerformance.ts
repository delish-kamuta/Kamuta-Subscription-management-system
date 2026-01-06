import { useState, useEffect, useMemo } from "react";
import { getDashboardAnalytics } from "~/services/overview";
import type { DashboardAnalyticsData } from "~/services/overview";

interface UseBranchPerformanceProps {
  branchId?: string;
  timeRange?: string;
}

export const useBranchPerformance = ({ branchId, timeRange }: UseBranchPerformanceProps) => {
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        let apiTimeRange: 'today' | 'week' | 'month' = 'week';
        if (timeRange === 'Today') apiTimeRange = 'today';
        if (timeRange === 'This Week') apiTimeRange = 'week';
        if (timeRange === 'This Month') apiTimeRange = 'month';

        const res = await getDashboardAnalytics({ time_range: apiTimeRange });
        if (res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch dashboard analytics", err);
        setError(err?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, branchId]);

  const processedData = useMemo(() => {
    if (!data) return null;

    const peopleServedByBranch = data.branch_analysis?.people_served_by_branch || [];
    const revenueByBranch = data.branch_analysis?.revenue_by_branch || [];

    const branchPerformance = peopleServedByBranch.map(b => ({
      name: b.branch,
      served: b.people_served,
      percentage: b.percentage,
      revenueData: revenueByBranch.find(r => r.branch === b.branch) || { total: 0, subscription: 0, paid_ticket: 0 }
    }));

    const totalServed = data.summary?.people_served?.total || 0;
    const totalRevenue = data.summary?.total_revenue?.amount || 0;
    // Use served people data for the pie chart
    const pieData = branchPerformance.map(b => ({
      name: b.name,
      value: b.served,
      percentage: b.percentage,
      revenue: b.revenueData.total
    }));

    return {
      branchPerformance,
      totalServed,
      totalRevenue,
      pieData
    };
  }, [data]);

  return { data, processedData, loading, error };
};
