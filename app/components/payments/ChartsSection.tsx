interface DailyRevenue {
  date: string;
  amount: number;
}

interface PaymentMethod {
  method: string;
  count: number;
  percentage: number;
}

interface ChartsSectionProps {
  dailyRevenue: DailyRevenue[];
  paymentMethods: PaymentMethod[];
  totalRevenue: number;
}

export default function ChartsSection({ dailyRevenue, paymentMethods, totalRevenue }: ChartsSectionProps) {
  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.amount));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 md:p-6">
      {/* Daily Revenue Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Daily Revenue (Last 7 Days)</h3>
        <div className="space-y-4">
          {dailyRevenue.map((day, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{day.date}</span>
                <span className="font-medium">${day.amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(day.amount / maxRevenue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Payment Method Breakdown</h3>
        <div className="space-y-6">
          {paymentMethods.map((method, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">{method.method}</span>
                <span className="text-gray-600">
                  {method.count} payments ({method.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${method.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
