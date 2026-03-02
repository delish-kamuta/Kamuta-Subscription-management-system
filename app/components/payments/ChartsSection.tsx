interface DailyRevenue {
  date: string;
  amount: number;
}

interface PaymentMethod {
  method: string;
  count: number;
  percentage: number;
}

import { BranchStatsTable } from "../../../components/BranchStatsTable";
import { TrendList } from "../../../components/TrendList";

interface DailyRevenue {
  date: string;
  amount: number;
}

interface PaymentMethod {
//...
}

interface RevenueByBranch {
  branch: string;
  topUp: number;
  newSub: number;
  total: number;
}

interface ChartsSectionProps {
  dailyRevenue: DailyRevenue[];
  paymentMethods: PaymentMethod[];
  totalRevenue: number;
  revenueByBranch?: RevenueByBranch[];
}

export default function ChartsSection({ dailyRevenue, paymentMethods, totalRevenue, revenueByBranch = [] }: ChartsSectionProps) {
  // Format currency helper
  const fmt = (n: number) => n.toLocaleString('en-US');

  // Define column config for BranchStatsTable
  const branchColumns = [
    { header: "Branch", accessorKey: "branch", align: "left" as const },
    { header: "TOP UP(RWF)", accessorKey: "topUp", align: "right" as const, render: (row: RevenueByBranch) => fmt(row.topUp) },
    { header: "NEW SUB(RWF)", accessorKey: "newSub", align: "right" as const, render: (row: RevenueByBranch) => fmt(row.newSub) },
    { header: "Total(RWF)", accessorKey: "total", align: "right" as const, render: (row: RevenueByBranch) => <span className="font-semibold">{fmt(row.total)}</span> },
  ];

  // Map daily revenue to Trend List items
  const trendItems = dailyRevenue.map(day => ({
      label: day.date,
      value: day.amount,
      formattedValue: `${day.amount.toLocaleString()} RWF`
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Total Payments Chart (Daily Revenue) */}
      <TrendList 
        title="Total Payments (This week)"
        items={trendItems}
      />

      {/* Payment Per Branch Table using specific component */}
      <BranchStatsTable 
        title="Payment Per Branch"
        data={revenueByBranch}
        columns={branchColumns}
        showTotalRow={true}
      />
    </div>
  );
}


