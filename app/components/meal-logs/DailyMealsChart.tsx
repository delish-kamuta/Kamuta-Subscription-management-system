interface DailyLog {
  date: string;
  count: number;
}

export const DailyMealsChart = ({ data }: { data: DailyLog[] }) => {
  const maxCountRaw = Math.max(...data.map((d) => d.count));
  const maxCount = Number.isFinite(maxCountRaw) && maxCountRaw > 0 ? maxCountRaw : 1;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <h3 className="font-semibold text-gray-900 mb-6">Meals Log Trends</h3>
      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">{item.date}</span>
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
      </div>
    </div>
  );
};
