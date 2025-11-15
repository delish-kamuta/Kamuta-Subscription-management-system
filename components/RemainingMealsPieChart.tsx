interface RemainingMealsPieChartProps {
  data?: {
    label: string;
    value: number;
    color: string;
  }[];
}

const RemainingMealsPieChart = ({ data }: RemainingMealsPieChartProps) => {
  const defaultData = [
    { label: "0 meals", value: 25, color: "#93c5fd" },
    { label: "1-5 meals", value: 60, color: "#2563eb" },
    { label: "Plenty meals", value: 15, color: "#60a5fa" },
  ];

  const chartData = data || defaultData;
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  let currentAngle = -90; // Start from top

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-6">Remaining Meals Overview</h3>
      <div className="flex items-center justify-center gap-8">
        {/* Pie Chart */}
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 200 200" className="transform -rotate-0">
            {chartData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;

              // Calculate path for pie slice
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = 100 + 90 * Math.cos(startRad);
              const y1 = 100 + 90 * Math.sin(startRad);
              const x2 = 100 + 90 * Math.cos(endRad);
              const y2 = 100 + 90 * Math.sin(endRad);

              const largeArc = angle > 180 ? 1 : 0;

              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 90 90 0 ${largeArc} 1 ${x2} ${y2}`,
                `Z`,
              ].join(" ");

              currentAngle += angle;

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  strokeWidth="2"
                  stroke="white"
                />
              );
            })}
          </svg>
          {/* Center hole to make it a donut chart */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full"></div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RemainingMealsPieChart;
