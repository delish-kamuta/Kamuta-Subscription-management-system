interface SubscriptionsChartProps {
  data?: {
    month: string;
    value: number;
  }[];
}

const SubscriptionsChart = ({ data }: SubscriptionsChartProps) => {
  const defaultData = [
    { month: "Jan", value: 2.8 },
    { month: "Feb", value: 1.8 },
    { month: "Mar", value: 3.8 },
    { month: "Apr", value: 1.5 },
    { month: "May", value: 2.2 },
    { month: "Jun", value: 2.5 },
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-6">Subscriptions</h3>
      <div className="relative" style={{ height: chartHeight }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
          <span>3k</span>
          <span>2k</span>
          <span>1k</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-8 h-full flex items-end justify-around gap-2">
          {chartData.map((item, index) => {
            const height = (item.value / maxValue) * 100;
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2"
              >
                {/* Bar */}
                <div
                  className="w-full relative"
                  style={{ height: chartHeight - 30 }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t-md relative group cursor-pointer transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  >
                    {/* Stacked bar effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-300/40 to-transparent rounded-t-md"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-200/30 to-transparent rounded-t-md"></div>

                    {/* Data point */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>

                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.value}k
                    </div>
                  </div>
                </div>
                {/* Month label */}
                <span className="text-xs text-gray-600">{item.month}</span>
              </div>
            );
          })}
        </div>

        {/* Line connecting points */}
        <svg
          className="absolute inset-0 ml-8 pointer-events-none"
          style={{ height: chartHeight - 30, width: "calc(100% - 2rem)" }}
        >
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={chartData
              .map((item, index) => {
                const x = ((index + 0.5) / chartData.length) * 100;
                const y = 100 - (item.value / maxValue) * 100;
                return `${x}%,${y}%`;
              })
              .join(" ")}
          />
        </svg>
      </div>
    </div>
  );
};

export default SubscriptionsChart;
