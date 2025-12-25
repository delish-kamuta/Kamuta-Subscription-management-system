import StatsCard from "../../../components/StatsCard";
import type { PaymentSummary } from "~/services/overview";

interface FinancialStatsSectionProps {
  summary: PaymentSummary | null;
}

export default function FinancialStatsSection({ summary }: FinancialStatsSectionProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6">
        <StatsCard title="Total Revenue" value={'-'} currentDay={0} lastDayCount={0} />
        <StatsCard title="Weekly Revenue" value={'-'} currentDay={0} lastDayCount={0} />
        <StatsCard title="Total Payments" value={'-'} currentDay={0} lastDayCount={0} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6">
      <StatsCard
        title="Total Revenue"
        value={summary.total_revenue}
        currentDay={summary.total_revenue}
        lastDayCount={summary.total_revenue} // No trend data available
      />
      <StatsCard
        title="Weekly Revenue"
        value={summary.weekly_revenue}
        currentDay={summary.weekly_revenue}
        lastDayCount={summary.weekly_revenue} // No trend data available
      />
      <StatsCard
        title="Total Payments"
        value={summary.total_payments}
        currentDay={summary.total_payments}
        lastDayCount={summary.total_payments} // No trend data available
      />
    </div>
  );
}
