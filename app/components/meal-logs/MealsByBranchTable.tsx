 import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ChevronDown, Filter } from "lucide-react";

interface BranchStats {
  Regular: number;
  VIP: number;
  VVIP: number;
}

interface DailyLog {
  date: string;
  count: number;
  filterValue?: string;
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
  
  const getPeriodLabel = () => {
    switch (timeFilter) {
      case "Day": return "Today";
      case "Week": return "This Week";
      case "Month": return "This Month";
      case "Year": return "This Year";
      default: return timeFilter;
    }
  };

  const periodLabel = getPeriodLabel();
  
  // Find currently selected log item for display label if needed
  const selectedLog = dailyLogsData.find(log => log.filterValue === selectedDate);
  const displayLabel = selectedLog ? selectedLog.date : (selectedDate || periodLabel);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          Meals Served By Branch {selectedDate ? `(${displayLabel})` : `(${periodLabel})`}
          {loading && <span className="text-xs font-normal text-muted-foreground animate-pulse">Updating...</span>}
        </h3>
        
        {/* Date Filter Dropdown */}
        {dailyLogsData.length > 0 && onDateSelect && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">
                  {displayLabel}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] bg-white">
              <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDateSelect(null)}
                className="cursor-pointer font-medium"
              >
                {periodLabel}
              </DropdownMenuItem>
              {dailyLogsData.map((log, idx) => {
                const isSelected = selectedDate === log.filterValue;
                // Only show item if it has a valid filter value
                if (!log.filterValue) return null;
                
                return (
                <DropdownMenuItem 
                  key={idx}
                  onClick={() => onDateSelect && onDateSelect(log.filterValue || null)}
                  className={`cursor-pointer justify-between ${isSelected ? "bg-slate-100" : ""}`}
                >
                  <span>{log.date}</span>
                  <span className="text-xs text-muted-foreground ml-2">({log.count})</span>
                </DropdownMenuItem>
              )})}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b border-gray-100">
              <th className="font-medium py-3">Branch</th>
              <th className="font-medium py-3">Regular</th>
              <th className="font-medium py-3">VIP</th>
              <th className="font-medium py-3">VVIP</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).length > 0 ? (
              Object.entries(data).map(([branchId, counts]) => (
                <tr
                  key={branchId}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                >
                  <td className="py-3 font-medium text-gray-900">
                    {resolveBranchName(branchId) || branchId}
                  </td>
                  <td className="py-3 text-gray-700">{counts.Regular}</td>
                  <td className="py-3 text-gray-700">{counts.VIP}</td>
                  <td className="py-3 text-gray-700">{counts.VVIP}</td>
                </tr>
              ))
            ) : (
               <tr>
                 <td colSpan={4} className="py-4 text-center text-gray-500">
                   No data available for this selection
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
