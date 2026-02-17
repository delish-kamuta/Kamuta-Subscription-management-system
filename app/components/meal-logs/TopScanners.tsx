import { useState } from "react";

interface UserStat {
  name: string;
  count: number;
}

export const TopScanners = ({ data, label }: { data: UserStat[]; label?: string }) => {
  const [expanded, setExpanded] = useState(false);
  const maxCount = data[0]?.count || 1;
  const displayData = expanded ? data : data.slice(0, 3);
  const showButton = data.length > 3;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Top Scanner Users {label}</h3>
      </div>
      <div className="space-y-4">
        {displayData.map((user, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-24 text-sm font-medium text-gray-700 truncate" title={user.name}>
              {user.name}
            </div>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${(user.count / maxCount) * 100}%` }}
              />
            </div>
            <div className="text-sm font-semibold text-gray-900">{user.count}</div>
          </div>
        ))}
        {showButton && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 text-sm font-medium cursor-pointer mt-2 hover:underline w-full text-left bg-transparent border-none p-0"
          >
            {expanded ? "View Less -" : "View More +"}
          </button>
        )}
      </div>
    </div>
  );
};
