interface DailyLog {
  date: string;
  count: number;
  filterValue?: string; // Optional raw value for filtering
}

interface DailyMealsChartProps {
  data: DailyLog[];
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
}

export const DailyMealsChart = ({ data, selectedDate, onSelectDate }: DailyMealsChartProps) => {
  // Ensure we have data even if empty
  const safeData = Array.isArray(data) ? data : [];
  
  const maxCountRaw = Math.max(...safeData.map((d) => d.count));
  const maxCount = Number.isFinite(maxCountRaw) && maxCountRaw > 0 ? maxCountRaw : 1;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  const handleSelect = (item: DailyLog) => {
    // Only allow selection if we have a valid filter value for the API
    if (onSelectDate && item.filterValue) {
      onSelectDate(item.filterValue);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-900">Meals Log Trends</h3>
        {selectedDate && (
           <button 
             onClick={(e) => { e.stopPropagation(); onSelectDate?.(""); }}
             className="text-xs text-blue-600 hover:underline px-2 py-1 rounded bg-blue-50"
           >
             Clear Filter
           </button>
        )}
      </div>
      
      <div className="space-y-6">
        {safeData.map((item, index) => {
          // Compare using filterValue strictly as selectedDate now holds the API-ready value
          const isSelected = !!selectedDate && !!item.filterValue && selectedDate === item.filterValue;
          return (
          <div 
            key={index} 
            onClick={() => handleSelect(item)}
            className={`cursor-pointer transition-colors p-2 rounded-lg -mx-2 ${isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className={`font-semibold min-w-[3rem] ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                {item.date || "N/A"}
              </span>
              <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                {item.count.toLocaleString()} meals
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-in-out ${isSelected ? 'bg-blue-700' : 'bg-blue-600'}`}
                style={{ width: `${clamp((item.count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
        )})}
        {safeData.length === 0 && (
           <div className="text-center text-gray-500 py-4">No meal data available</div>
        )}
      </div>
    </div>
  );
};
