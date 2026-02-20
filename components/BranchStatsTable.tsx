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

export interface BranchStatColumn {
  header: string;
  accessorKey?: string;
  render?: (row: any) => React.ReactNode;
  align?: "left" | "right" | "center";
}

export interface DailyLog {
  date: string;
  count: number;
  filterValue?: string;
}

interface BranchStatsTableProps {
  title: string;
  data: any[];
  columns: BranchStatColumn[];
  
  // Optional Date Filter props
  dailyLogsData?: DailyLog[];
  selectedDate?: string | null;
  onDateSelect?: (date: string | null) => void;
  timeFilter?: string;
  
  loading?: boolean;
  showTotalRow?: boolean;
}

export const BranchStatsTable = ({
  title,
  data,
  columns,
  dailyLogsData = [],
  selectedDate,
  onDateSelect,
  timeFilter = "Week",
  loading = false,
  showTotalRow = false,
}: BranchStatsTableProps) => {

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
          {title} {dailyLogsData.length > 0 ? (selectedDate ? `(${displayLabel})` : `(${periodLabel})`) : ""}
          {loading && <span className="text-xs font-normal text-muted-foreground animate-pulse">Updating...</span>}
        </h3>
        
        {/* Date Filter Dropdown - Only show if data/handler provided */}
        {dailyLogsData.length > 0 && onDateSelect && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-8 gap-1 border border-gray-200">
                <Filter className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">
                  {displayLabel}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] bg-white border-gray-200">
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
            <tr className="text-gray-400 border-b border-gray-100 text-xs uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`font-medium py-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      className={`py-4 ${
                         colIdx === 0 ? "font-medium text-gray-900" : "text-gray-600"
                      } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      {col.render ? col.render(row) : (col.accessorKey ? row[col.accessorKey] : "-")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
               <tr>
                 <td colSpan={columns.length} className="py-8 text-center text-gray-500">
                   No data available
                 </td>
               </tr>
            )}
            
            {/* Optional Total Row - naïve implementation summing numeric keys */}
            {showTotalRow && data.length > 0 && (
                 <tr className="bg-gray-50/30 font-bold">
                    {columns.map((col, idx) => (
                        <td key={idx} className={`py-4 text-gray-900 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                            {idx === 0 ? "Total" : (
                                col.accessorKey 
                                  ? (
                                      typeof data[0][col.accessorKey] === 'number' 
                                      ? data.reduce((sum, item) => sum + (item[col.accessorKey] || 0), 0).toLocaleString()
                                      : ""
                                    )
                                  : ""
                            )}
                        </td>
                    ))}
                 </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
