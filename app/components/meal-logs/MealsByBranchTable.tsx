interface BranchStats {
  Regular: number;
  VIP: number;
  VVIP: number;
}

export const MealsByBranchTable = ({
  data,
  resolveBranchName,
}: {
  data: Record<string, BranchStats>;
  resolveBranchName: (id: string) => string;
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <h3 className="font-semibold text-gray-900 mb-4">
        Meals Served By Branch (This week)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b border-gray-100">
              <th className="font-medium py-3">Branch</th>
              <th className="font-medium py-3">Regular</th>
              <th className="font-medium py-3">VIP</th>
              <th className="font-medium py-3">VVIP</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([branchId, counts]) => (
              <tr
                key={branchId}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
              >
                <td className="py-3 font-medium text-gray-900">
                  {resolveBranchName(branchId) || branchId}
                </td>
                <td className="py-3 text-gray-700">{counts.Regular}</td>
                <td className="py-3 text-gray-700">{counts.VIP}</td>
                <td className="py-3 text-gray-700">{counts.VVIP}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
