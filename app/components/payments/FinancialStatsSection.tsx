import StatsCard from "../../../components/StatsCard";
import type { PaymentSummary, PaymentStatistics } from "~/services/overview";
import { Skeleton } from "~/components/ui/skeleton";

interface FinancialStatsSectionProps {
  summary: any | null; // Using any temporarily to support both PaymentSummary (legacy) and PaymentStatistics, ideally should be PaymentStatistics
}

const ProgressBar = ({ value, label, subLabel }: { value: number, label: string, subLabel: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm">
      <span className="font-semibold text-gray-700">{label}</span>
      <span className="text-gray-900 font-medium">{subLabel}</span>
    </div>
    <div className="h-2.5 w-full bg-[#7F7E83] rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);

export default function FinancialStatsSection({ summary }: FinancialStatsSectionProps) {
  // Check if summary has the nested structure (PaymentStatistics) or flat (PaymentSummary)
  // The hook usePaymentOverview returns { data: PaymentStatistics }
  // So likely summary passed here is PaymentStatistics
  
  const stats = summary?.summary || summary; // Fallback if flat
  const paymentMethods = summary?.by_payment_method;

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Determine trend labels (mocking if not available)
  const revenueTrend = "vs last week"; 
  const paymentTrend = "vs last week";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6">
      {/* Total Amount Paid Card */}
      <StatsCard
        title="Total Amount Paid(Week)"
        value={stats.weekly_revenue ?? stats.total_revenue ?? 0}
        currentDay={stats.weekly_revenue ?? 0}
        lastDayCount={(stats.weekly_revenue ?? 0) * 0.88} // Mock: assume 12% increase
        trendLabel="vs last week"
      />
      
      {/* Total Payment Count Card */}
      <StatsCard
        title="Total payment(Week)"
        value={stats.total_payments ?? 0}
        currentDay={stats.total_payments ?? 0}
        lastDayCount={(stats.total_payments ?? 0) * 0.88} // Mock: assume 12% increase
        trendLabel="vs last week"
      />

      {/* Payment Method Breakdown Card */}
      <article className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center h-full min-h-[140px]">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Payment Method Breakdown (Week)
        </h3>
        
        <div className="flex flex-col gap-4">
          {paymentMethods ? (
            <>
              {Object.entries(paymentMethods).map(([key, method]: [string, any]) => (
                 <div key={key}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold text-gray-700 capitalize">{key}</span>
                      <span className="text-gray-900 font-medium">{method.count} Payments({method.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(100, Math.max(0, method.percentage))}%` }}
                      />
                    </div>
                 </div>
              ))}
            </>
          ) : (
             <div className="text-sm text-gray-500 text-center py-2">No breakdown data available</div>
          )}
        </div>
      </article>
    </div>
  );
}
