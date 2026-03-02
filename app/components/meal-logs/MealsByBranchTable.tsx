import { BranchStatsTable, type DailyLog } from "../../../components/BranchStatsTable";

interface BranchStats {
  Regular: number;
  VIP: number;
  VVIP: number;
}

interface MealsByBranchTableProps {
  data: Record<string, BranchStats>;
  resolveBranchName: (id: string) => string;
  dailyLogsData?: DailyLog[];
  selectedDate?: string | null;
  onDateSelect?: (date: string | null) => void;
  timeFilter?: string;
  loading?: boolean;
}

export const MealsByBranchTable = ({
  data,
  resolveBranchName,
  dailyLogsData = [],
  selectedDate,
  onDateSelect,
  timeFilter = "Week",
  loading = false,
}: MealsByBranchTableProps) => {
  
  // Transform object data Record<branchId, stats> to array for generic table
  const tableData = Object.entries(data).map(([branchId, stats]) => ({
    branch: resolveBranchName(branchId) || branchId,
    Regular: stats.Regular,
    VIP: stats.VIP,
    VVIP: stats.VVIP
  }));

  const columns = [
    { header: "Branch", accessorKey: "branch", align: "left" as const },
    { header: "Regular", accessorKey: "Regular", align: "left" as const },
    { header: "VIP", accessorKey: "VIP", align: "left" as const },
    { header: "VVIP", accessorKey: "VVIP", align: "left" as const },
  ];

  return (
    <BranchStatsTable 
      title="Meals Served By Branch"
      data={tableData}
      columns={columns}
      dailyLogsData={dailyLogsData}
      selectedDate={selectedDate}
      onDateSelect={onDateSelect}
      timeFilter={timeFilter}
      loading={loading}
    />
  );
};

