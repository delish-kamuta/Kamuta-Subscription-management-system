interface MealStat {
  name: string;
  value: number;
}

export const LunchVsSupper = ({ data }: { data: MealStat[] }) => {
  const maxVal = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <h3 className="font-semibold text-gray-900 mb-6">Lunch VS Supper</h3>
      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.name} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.name}</span>
              <span className="font-bold text-gray-900">{item.value}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${(item.value / maxVal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
