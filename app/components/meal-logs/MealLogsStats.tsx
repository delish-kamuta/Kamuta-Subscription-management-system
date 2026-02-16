import { useMemo, useState } from "react";
import StatsCard from "../../../components/StatsCard";
import { TopScanners } from "./TopScanners";
import { LunchVsSupper } from "./LunchVsSupper";
import { DailyMealsChart } from "./DailyMealsChart";
import { MealsByBranchTable } from "./MealsByBranchTable";
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
  data: any[];
  resolveUserName: (id: string | number | null | undefined) => string;
  resolveBranchName: (id: string | number | null | undefined) => string;
  branches: any[];
}

export const MealLogsStats = ({
  data,
  resolveUserName,
  resolveBranchName,
  branches,
}: MealLogsStatsProps) => {
  const [timeFilter, setTimeFilter] = useState("Week");
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const currentMonthName = today.toLocaleString("default", { month: "long" });

  const stats = useMemo(() => {
    // --- SAMPLE DATA OVERRIDE ---
    const useSampleData = true; 

    // Helper for generating sample data based on filter
    const getSampleDailyLogs = (filter: string) => {
        const today = new Date();
        const formatDate = (date: Date) => date.toISOString().split("T")[0]; // YYYY-MM-DD for consistency
        if (filter === "Day") {
            // Last 7 Actual Days (e.g., "2026-02-10" to "2026-02-16")
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                days.push({ date: formatDate(d), count: Math.floor(Math.random() * (200 - 80) + 80) });
            }
            return days;
        } else if (filter === "Week") {
           // Last 4 Weeks with Start-End Date Ranges
           // E.g., "Feb 2 - Feb 8", "Feb 9 - Feb 15"
           return [
               { date: "Jan 19 - Jan 25", count: 850 },
               { date: "Jan 26 - Feb 01", count: 920 },
               { date: "Feb 02 - Feb 08", count: 950 },
               { date: "Feb 09 - Feb 15", count: 1050 },
           ];
        } else if (filter === "Month") {
            // Previous and Current Months
            return [
                { date: "September", count: 2800 },
                { date: "October", count: 3100 },
                { date: "November", count: 2900 },
                { date: "December", count: 3500 },
                { date: "January", count: 3200 },
                { date: "February", count: 1250 }, // Partial month
            ];
        } else if (filter === "Year") {
             // Previous and Current Years
            return [
                { date: "2022", count: 25000 },
                { date: "2023", count: 32000 },
                { date: "2024", count: 38000 },
                { date: "2025", count: 41000 },
                { date: "2026", count: 5450 }, // YTD
            ];
        }
        return [];
    };

    if (useSampleData) {
      return {
        totalMeals: 12450,
        thisMonthMeals: 1250,
        lastMonthMeals: 1100, // For trend calculation
        topScanners: [
          { name: "Anatory", count: 1000 },
          { name: "Consolee", count: 1000 },
          { name: "Mbabazi", count: 1000 },
        ],
        lunchVsSupperData: [
          { name: "Lunch", value: 1000 },
          { name: "Supper", value: 900 },
        ],
        dailyLogsData: getSampleDailyLogs(timeFilter),
        branchStats: {
          "1": { Regular: 540, VIP: 20, VVIP: 20 }, // CAVM (assuming id 1)
          "2": { Regular: 412, VIP: 12, VVIP: 12 }, // Downtown
          "3": { Regular: 296, VIP: 68, VVIP: 68 }, // Kimironko
        },
      };
    }

    let totalMeals = 0;
    let lastMonthMeals = 0;
    const scannerCounts: Record<string, number> = {};
    const lunchVsSupper = { Lunch: 0, Supper: 0 };
    const branchStats: Record<string, { Regular: number; VIP: number; VVIP: number }> = {};

    branches.forEach((b) => {
      branchStats[String(b.id)] = { Regular: 0, VIP: 0, VVIP: 0 };
    });

    const dailyLogsMap: Record<string, number> = {};
    
    // Dynamic Date Logic based on Filter (Real Data)
    if (timeFilter === "Day") {
       // Show last 7 days (or Mon-Sun)
       const start = new Date();
       start.setDate(start.getDate() - 6); 
       for(let i=0; i<7; i++) {
           const d = new Date(start); 
           d.setDate(d.getDate() + i);
           const key = d.toLocaleDateString('en-US', { weekday: 'long' }); // Mon, Tue...
           // Note: This simple keying might overlap if we cross weeks, better to bucket by iso count
           // But for simplicity of this logic:
           dailyLogsMap[key] = 0; 
       }
       // ... population logic would need to map logs to day names
    }
    // For now we will stick to Sample Data for the dynamic view as requested for the demo, 
    // since implementing full date-bucketing for all ranges on client-side array is complex 
    // without helper libraries like date-fns/moment imported.
    // The ELSE block below is the original "Week" logic.

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      dailyLogsMap[d.toISOString().split("T")[0]] = 0;
    }

    data.forEach((log) => {
      const logDate = new Date(log.created_at);
      totalMeals++;

      if (
        logDate.getMonth() === lastMonth &&
        logDate.getFullYear() === lastMonthYear
      ) {
        lastMonthMeals++;
      }

      const scannerId = log.scanned_by || log.scanner?.id || "unknown";
      scannerCounts[scannerId] = (scannerCounts[scannerId] || 0) + 1;

      const hour = logDate.getHours();
      if (hour >= 11 && hour < 15) lunchVsSupper.Lunch++;
      else if (hour >= 17 && hour < 21) lunchVsSupper.Supper++;

      const bId = String(log.branch_id || "");
      if (branchStats[bId]) {
        const mType = log.meal_type as "Regular" | "VIP" | "VVIP";
        if (branchStats[bId][mType] !== undefined) {
          branchStats[bId][mType]++;
        }
      } else if (bId) {
        if (!branchStats[bId]) branchStats[bId] = { Regular: 0, VIP: 0, VVIP: 0 };
        const mType = log.meal_type as "Regular" | "VIP" | "VVIP";
        if (branchStats[bId][mType] !== undefined) branchStats[bId][mType]++;
      }

      const dateKey = logDate.toISOString().split("T")[0];
      if (dailyLogsMap[dateKey] !== undefined) {
        dailyLogsMap[dateKey]++;
      }
    });

    const topScanners = Object.entries(scannerCounts)
      .map(([id, count]) => ({ name: resolveUserName(id) || id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const dailyLogsData = Object.entries(dailyLogsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let thisMonthMeals = 0;
    data.forEach((log) => {
      const d = new Date(log.created_at);
      if (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      )
        thisMonthMeals++;
    });

    return {
      totalMeals,
      thisMonthMeals,
      lastMonthMeals,
      topScanners,
      lunchVsSupperData: [
        { name: "Lunch", value: lunchVsSupper.Lunch },
        { name: "Supper", value: lunchVsSupper.Supper },
      ],
      dailyLogsData,
      branchStats,
    };
  }, [
    data,
    resolveUserName,
    branches,
    currentMonth,
    currentYear,
    lastMonth,
    lastMonthYear,
    timeFilter // Added dependency
  ]);

  // If using sample data, we might need to map branch IDs to names manually if they don't exist in the branches prop
  const enhancedResolveBranchName = (id: string) => {
    if (id === "1") return "CAVM";
    if (id === "2") return "Downtown";
    if (id === "3") return "Kimironko";
    return resolveBranchName(id);
  };

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
