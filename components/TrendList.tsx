
import { useState } from "react";
import { Button } from "~/components/ui/button";

interface TrendItem {
  label: string;
  value: number;
  formattedValue: string | number;
  subLabel?: string;
  key?: string; // Unique identifier for selection
}

interface TrendListProps {
  title: string;
  items: TrendItem[];
  onSelect?: (item: TrendItem) => void;
  selectedKey?: string | null;
  emptyMessage?: string;
  loading?: boolean;
  maxValue?: number;
  limit?: number;
}

export const TrendList = ({
  title,
  items,
  onSelect,
  selectedKey,
  emptyMessage = "No data available",
  loading = false,
  maxValue,
  limit,
}: TrendListProps) => {
  const [expanded, setExpanded] = useState(false);
  const safeData = Array.isArray(items) ? items : [];

  // Calculate max value for progress bar scaling
  const dataMax = Math.max(...safeData.map((d) => d.value));
  const maxValRaw = maxValue !== undefined ? maxValue : dataMax;
  const maxVal = Number.isFinite(maxValRaw) && maxValRaw > 0 ? maxValRaw : 1;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  const itemsToShow = limit && !expanded ? safeData.slice(0, limit) : safeData;
  const hasMore = limit ? safeData.length > limit : false;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col relative pb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          {title}
          {loading && <span className="text-xs font-normal text-muted-foreground animate-pulse">Updating...</span>}
        </h3>
        
        {/* Clear Filter Button if selection is active */}
        {selectedKey && onSelect && (
           <button 
             onClick={(e) => { e.stopPropagation(); onSelect({ label: "", value: 0, formattedValue: "", key: "" }); }} // Sending empty/dummy to clear
             className="text-xs text-blue-600 hover:underline px-2 py-1 rounded bg-blue-50"
           >
             Clear Filter
           </button>
        )}
      </div>

      <div className="space-y-6">
        {itemsToShow.map((item, index) => {
          const isSelected = !!selectedKey && !!item.key && selectedKey === item.key;
          const isClickable = !!onSelect;

          return (
            <div 
              key={index}
              onClick={() => isClickable && onSelect && onSelect(item)}
              className={`transition-colors p-2 rounded-lg -mx-2 ${
                isClickable ? 'cursor-pointer' : ''
              } ${
                isSelected ? 'bg-blue-50 border border-blue-100' : isClickable ? 'hover:bg-slate-50' : ''
              }`}
            >
              <div className="flex justify-between text-sm mb-1.5">
                <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                  {item.label || "N/A"}
                </span>
                <span className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {item.formattedValue}
                </span>
              </div>
              <div className="w-full bg-[#7F7E83] rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${
                    isSelected ? 'bg-blue-700' : 'bg-blue-600'
                  }`}
                  style={{ width: `${clamp((item.value / maxVal) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
        
        {safeData.length === 0 && (
           <div className="text-center text-gray-500 py-4">{emptyMessage}</div>
        )}
      </div>

      {hasMore && (
        <div className="absolute bottom-4 right-6">
          <Button 
            variant="link" 
            size="sm"
            className="px-0 py-0 h-auto text-blue-600 font-medium" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "View Less" : "View More +"}
          </Button>
        </div>
      )}
    </div>
  );
};
