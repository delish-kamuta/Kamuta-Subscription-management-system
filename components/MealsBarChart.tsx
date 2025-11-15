interface MealsBarChartProps {
  data?: {
    label: string;
    value: number;
  }[];
}

const MealsBarChart = ({ data }: MealsBarChartProps) => {
  const defaultData = [
    { label: "CST", value: 15 },
    { label: "CVM", value: 30 },
    { label: "CBE", value: 20 },
    { label: "CMHS", value: 50 },
    { label: "CAS", value: 25 },
    { label: "CST", value: 35 },
    { label: "CST", value: 18 },
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-6">
        Meals Scanned by Subscription
      </h3>
      <div className="h-64">
        {/* Y-axis labels */}
        <div className="flex h-full">
          <div className="flex flex-col justify-between text-xs text-gray-500 pr-2">
            <span>50%</span>
            <span>30%</span>
            <span>10%</span>
          </div>

          {/* Chart area */}
          <div className="flex-1 flex items-end justify-around gap-3 border-b border-gray-200">
            {chartData.map((item, index) => {
              const height = (item.value / maxValue) * 100;
              const isHighest = item.value === maxValue;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2 relative group"
                >
                  {/* Bar */}
                  <div className="w-full relative" style={{ height: "220px" }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t-md transition-all cursor-pointer ${
                        isHighest
                          ? "bg-gradient-to-t from-blue-600 to-blue-500"
                          : "bg-gradient-to-t from-blue-300 to-blue-200"
                      } hover:opacity-80`}
                      style={{ height: `${height}%` }}
                    >
                      {/* Percentage label for highest */}
                      {isHighest && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded font-medium">
                          {item.value}%
                        </div>
                      )}

                      {/* Hover tooltip for others */}
                      {!isHighest && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.value}%
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Label */}
                  <span className="text-xs text-gray-600 font-medium">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealsBarChart;
