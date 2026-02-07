import { useState, useEffect, useMemo } from "react";
import { getDashboardAnalytics } from "~/services/overview";
import type { DashboardAnalyticsData } from "~/services/overview";

interface UseBranchPerformanceProps {
  branchId?: string;
  timeRange?: string;
}

// Helper to safely convert any value to a number
const safeNumber = (val: any): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const num = parseFloat(String(val)); // Use parseFloat to handle strings like "583.34"
  return isNaN(num) ? 0 : num;
};

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

    const branchPerformance = peopleServedByBranch.map(b => {
      const r = revenueByBranch.find(r => r.branch === b.branch);
      return {
        name: b.branch,
        served: safeNumber(b.people_served),
        percentage: safeNumber(b.percentage),
        revenueData: {
          total: safeNumber(r?.total),
          subscription: safeNumber(r?.subscription),
          paid_ticket: safeNumber(r?.paid_ticket)
        }
      };
    });

    const totalServed = safeNumber(data.summary?.people_served?.total);
    const totalRevenue = safeNumber(data.summary?.total_revenue?.amount);
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
