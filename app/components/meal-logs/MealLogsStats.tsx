import { useState, useEffect } from "react";
import StatsCard from "../../../components/StatsCard";
import { getMealLogsStats, type MealLogsStatsResponse } from "~/services/mealLogs";
import { TopScanners } from "./TopScanners";
import { LunchVsSupper } from "./LunchVsSupper";
import { DailyMealsChart } from "./DailyMealsChart";
import { MealsByBranchTable } from "./MealsByBranchTable";
import { Skeleton } from "~/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ChevronDown } from "lucide-react";

interface MealLogsStatsProps {
  resolveUserName: (id: string | number | null | undefined) => string;
  resolveBranchName: (id: string | number | null | undefined) => string;
  branches: any[];
}

export const MealLogsStats = ({
  resolveUserName,
  resolveBranchName,
  branches,
}: MealLogsStatsProps) => {
  const [timeFilter, setTimeFilter] = useState("Week");
  const [statsData, setStatsData] = useState<MealLogsStatsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);

  // Initial skeleton/empty state
  const today = new Date();
  const currentMonthName = today.toLocaleString("default", { month: "long" });

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      setLoading(true);
      try {
        const response = await getMealLogsStats(timeFilter);
        if (isMounted && response.success && response.data) {
          setStatsData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch meal logs stats", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, [timeFilter]);

  // Transform API data to component props format
  const stats = {
    totalMeals: statsData?.totalMeals ?? 0,
    // Provide defaults for month stats if not in API response
    thisMonthMeals: statsData?.thisMonthMeals ?? 0,
    lastMonthMeals: statsData?.lastMonthMeals ?? 0,
    
    // Map API topScanners to { name, count }
    topScanners: statsData?.topScanners?.map(s => ({
      name: s.full_name || "Unknown",
      count: s.count
    })) || [],

    // Transform lunchVsSupper object { Lunch: 3, Supper: 1 } to array
    lunchVsSupperData: [
      { name: "Lunch", value: statsData?.lunchVsSupperData?.Lunch || 0 },
      { name: "Supper", value: statsData?.lunchVsSupperData?.Supper || 0 },
    ],

    // Map dailyLogsData label -> date
    dailyLogsData: statsData?.dailyLogsData?.map(d => ({
      date: (timeFilter === "Week" || timeFilter === "Day") && d.day ? d.day : d.date || d.day, 
      count: d.count
    })) || [],

    branchStats: statsData?.branchStats || {},
  };

  // Function to display branch name - since API returns name as key, we can just return it
  const enhancedResolveBranchName = (key: string) => {
    // If the key looks like an ID (numeric), try resolving it. Otherwise assume it's a name.
    if (!isNaN(Number(key))) {
        return resolveBranchName(key) || `Branch ${key}`;
    }
    return key;
  };

  if (loading || !statsData) {
    return (
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-[120px] rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Meals Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[160px]">
            <Skeleton className="h-5 w-1/3 mb-4" />
            <Skeleton className="h-10 w-1/2 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Top Scanners Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[160px]">
             <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-5 w-1/3" />
             </div>
             <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-center gap-3">
                   <Skeleton className="h-4 w-24" />
                   <Skeleton className="h-2 flex-1 rounded-full" />
                 </div>
               ))}
             </div>
          </div>

          {/* Lunch VS Supper Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[160px]">
            <Skeleton className="h-5 w-1/3 mb-6" />
            <div className="space-y-6">
               {[1, 2].map((i) => (
                 <div key={i} className="flex flex-col gap-2">
                   <div className="flex justify-between">
                     <Skeleton className="h-4 w-16" />
                     <Skeleton className="h-4 w-8" />
                   </div>
                   <Skeleton className="h-2 w-full rounded-full" />
                 </div>
               ))}
            </div>
          </div>

          {/* Daily Logs & Branch Stats Skeleton */}
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
                <Skeleton className="h-5 w-1/3 mb-6" />
                {/* Skeleton Chart Bars */}
                <div className="mt-8 h-[200px] flex items-end gap-2 px-2">
                   {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${Math.random() * 60 + 20}%` }} />
                   ))}
                </div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
                <Skeleton className="h-5 w-1/2 mb-6" />
                <div className="space-y-4">
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-4 w-1/6" />
                  </div>
                  {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="flex justify-between py-3 border-b border-gray-50 last:border-0">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-8" />
                     </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Filters */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="min-w-[100px] justify-between border border-black/10">
              {timeFilter}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-none">
            <DropdownMenuLabel>Time Range</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTimeFilter("Day")}>Day</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter("Week")}>Week</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter("Month")}>Month</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter("Year")}>Year</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Meals Card */}
        <StatsCard
          title={`Total Meals ${currentMonthName}`}
          value={stats.thisMonthMeals}
          currentDay={stats.thisMonthMeals}
          lastDayCount={stats.lastMonthMeals}
        />

        {/* Top Scanner Users */}
        <TopScanners data={stats.topScanners} />

        {/* Lunch VS Supper */}
        <LunchVsSupper data={stats.lunchVsSupperData} />

        {/* Daily Meals Logs & Meals Served By Branch */}
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyMealsChart data={stats.dailyLogsData} />
          <MealsByBranchTable
            data={stats.branchStats}
            resolveBranchName={enhancedResolveBranchName}
          />
        </div>
      </div>
    </div>
  );
};
