interface DailyLog {
  date: string;
  count: number;
}

export const DailyMealsChart = ({ data }: { data: DailyLog[] }) => {
  // Ensure we have data even if empty
  const safeData = Array.isArray(data) ? data : [];
  
  const maxCountRaw = Math.max(...safeData.map((d) => d.count));
  const maxCount = Number.isFinite(maxCountRaw) && maxCountRaw > 0 ? maxCountRaw : 1;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-900">Meals Log Trends</h3>
      </div>
      
      <div className="space-y-6">
        {safeData.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700 font-semibold min-w-[3rem]">{item.date || "N/A"}</span>
              <span className="font-medium text-gray-900">{item.count.toLocaleString()} meals</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${clamp((item.count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
        ))}
        {safeData.length === 0 && (
           <div className="text-center text-gray-500 py-4">No meal data available</div>
        )}
      </div>
    </div>
  );
};
