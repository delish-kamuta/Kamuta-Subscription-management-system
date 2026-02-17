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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<MealLogsStatsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  
  // Helper to extract clean date string for API based on time filter
  const extractDateForApi = (selectedDateValue: string | null, filter: string): string | undefined => {
    if (!selectedDateValue) return undefined;
    
    // selectedDateValue is now predominantly the filterValue (YYYY-MM-DD standard, or raw label)

    // Regular Expression for YYYY-MM-DD
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (isoDateRegex.test(selectedDateValue)) {
        // If we have a full date, it satisfies all conditions (Full date is accepted for all filters)
        return selectedDateValue;
    }

    // If we have D/M/YYYY or DD/MM/YYYY format (fallback)
    // Relaxed regex to allow single digit day/month
    const dmyMatch = selectedDateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmyMatch) {
      // Pad single digits with 0
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }

    // If Year filter and value is just year "2025" or "2026"
    if (filter === "Year" && /^\d{4}$/.test(selectedDateValue)) {
        return selectedDateValue;
    }
    
    // If Month filter "YYYY-MM"
     if (filter === "Month" && /^\d{4}-\d{2}$/.test(selectedDateValue)) {
        return selectedDateValue;
    }

    return selectedDateValue; 
  };

  // When time filter changes, reset selected date
  useEffect(() => {
    setSelectedDate(null);
  }, [timeFilter]);

  // Initial skeleton/empty state
  const today = new Date();
  const currentMonthName = today.toLocaleString("default", { month: "long" });

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      // If we already have data, don't show full loading skeleton, just a subtle indicator if needed
      if (!statsData) setLoading(true);
      else setIsRefetching(true);

      try {
        const dateParam = extractDateForApi(selectedDate, timeFilter);
        const response = await getMealLogsStats(timeFilter, dateParam);
        if (isMounted && response.success && response.data) {
          setStatsData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch meal logs stats", err);
      } finally {
        if (isMounted) {
            setLoading(false);
            setIsRefetching(false);
        }
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, [timeFilter, selectedDate]);

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
    dailyLogsData: statsData?.dailyLogsData?.map((d: any) => {
      // Prioritize `day` (e.g., "Mon") for Week/Day view, otherwise fallback to `date` (e.g., "23/02/2026")
      // Ensure we always return a string, even if properties are missing
      const day = d.day || d.Day;
      const date = d.date || d.Date; // Expected format: DD/MM/YYYY or YYYY-MM-DD
      const label = d.label || d.Label; 
      
      let displayDate = "Unknown";
      let filterValue = "";

      // Logic for display label
      if (day && date && (timeFilter === "Week" || timeFilter === "Day")) {
        displayDate = `${day}, ${date}`;
      } 
      else if (date) {
        displayDate = date;
      } else if (day) {
        displayDate = day;
      } else if (label) {
        displayDate = label;
      }

      // Logic for filter value (what is sent to backend for drill-down)
      // Ensure we prioritize a structured date format YYYY-MM-DD
      if (date) {
        // Try to convert DD/MM/YYYY to YYYY-MM-DD standard for API
        const dmyMatch = date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        
        // Also check if date field itself contains range "Feb 08 - Feb 14"
        const rangeMatchDate = typeof date === 'string' ? date.match(/([A-Za-z]{3})\s+(\d{1,2})\s+-\s+([A-Za-z]{3})\s+(\d{1,2})/) : null;

        if (dmyMatch) {
            filterValue = `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
        } else if (rangeMatchDate) {
             // If date field has the range string, parse it here
             const [_, m1, d1, m2, d2] = rangeMatchDate;
             const now = new Date();
             const currentYear = now.getFullYear();
             const currentMonth = now.getMonth() + 1; // 1-12

             const monthMap: Record<string, string> = {
                "Jan": "1", "Feb": "2", "Mar": "3", "Apr": "4", "May": "5", "Jun": "6",
                "Jul": "7", "Aug": "8", "Sep": "9", "Oct": "10", "Nov": "11", "Dec": "12"
             };
             const startMonth = monthMap[m1];
             const endMonth = monthMap[m2];
             
             if (startMonth && endMonth) {
                 const startY = parseInt(startMonth) > currentMonth ? currentYear - 1 : currentYear;
                 const endY = parseInt(endMonth) > currentMonth ? currentYear - 1 : currentYear;
                 
                 const startDate = `${parseInt(d1)}/${startMonth}/${startY}`;
                 const endDate = `${parseInt(d2)}/${endMonth}/${endY}`;
                 filterValue = `${startDate}-${endDate}`;
             } else {
                 filterValue = date;
             }
        } else {
            // Check if it's already YYYY-MM-DD
            const isoMatch = date.match(/^\d{4}-\d{2}-\d{2}$/);
            filterValue = isoMatch ? date : ""; 
        }
      } 
      
      // If no valid date found, try strict fallback based on filter type
      if (!filterValue) {
        if (timeFilter === "Year") {
             // For Year filter, the data might be monthly aggregation
             // If label or day looks like a month or partial date, we might want to use it or construct a date
             const val = label || day;
             // If val is YYYY-MM
             if (/^\d{4}-\d{2}$/.test(val)) filterValue = val;
             // If val is YYYY
             else if (/^\d{4}$/.test(val)) filterValue = val;
             // If val is a month name, we might just use it if backend supports it, or leave empty
             else if (val) {
                // Try to map month name to number/year
                const year = new Date().getFullYear();
                const monthNameMap: Record<string, string> = {
                    "January": "1", "February": "2", "March": "3", "April": "4", "May": "5", "June": "6",
                    "July": "7", "August": "8", "September": "9", "October": "10", "November": "11", "December": "12",
                    "Jan": "1", "Feb": "2", "Mar": "3", "Apr": "4", "Jun": "6", "Jul": "7", "Aug": "8", "Sep": "9", "Oct": "10", "Nov": "11", "Dec": "12"
                };
                // Check if val aligns with any key (case insensitive probably not needed if API is consistent, but let's be safe)
                // Assuming title case from API based on "February"
                if (monthNameMap[val]) {
                    filterValue = `${monthNameMap[val]}/${year}`;
                } else {
                    filterValue = val;
                }
             } 
        }
        else if (timeFilter === "Month" || timeFilter === "Week") {
             // For Month filter, data is usually daily or weekly
             // For Week filter, sometimes we might see ranges too if the backend response structure is tricky
             const val = label || day;
             
             // Check for "Month DD - Month DD" pattern (e.g., "Feb 08 - Feb 14")
             const rangeMatch = val?.match(/([A-Za-z]{3})\s+(\d{1,2})\s+-\s+([A-Za-z]{3})\s+(\d{1,2})/);
             
             if (rangeMatch) {
                const [_, m1, d1, m2, d2] = rangeMatch;
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1; // 1-12
                
                const monthNameMap: Record<string, string> = {
                    "Jan": "1", "Feb": "2", "Mar": "3", "Apr": "4", "May": "5", "Jun": "6",
                    "Jul": "7", "Aug": "8", "Sep": "9", "Oct": "10", "Nov": "11", "Dec": "12"
                };

                const startMonth = monthNameMap[m1];
                const endMonth = monthNameMap[m2];

                if (startMonth && endMonth) {
                    // Logic to handle past years
                    // If startMonth (e.g. 10) > currentMonth (e.g., 2), assume it was last year.
                    // This assumes we are viewing historical data (common in analytics).
                    const startY = parseInt(startMonth) > currentMonth ? currentYear - 1 : currentYear;
                    const endY = parseInt(endMonth) > currentMonth ? currentYear - 1 : currentYear;

                    // Edge case: Dec 28 - Jan 03.
                    // startMonth=12, current=2 -> startY=2025.
                    // endMonth=1, current=2 -> endY=2026.
                    // Correct.
                    
                    const startDate = `${parseInt(d1)}/${startMonth}/${startY}`;
                    const endDate = `${parseInt(d2)}/${endMonth}/${endY}`;
                    filterValue = `${startDate}-${endDate}`;
                } else {
                    filterValue = val;
                }
             } else {
                // If not a range, check if it's a month name (e.g. "February" or "Feb")
                // This handles cases where Month filter might actually be showing aggregation by months
                 const now = new Date();
                 const currentYear = now.getFullYear();
                 const currentMonth = now.getMonth() + 1; // 1-12
                 
                 const monthNameMap: Record<string, string> = {
                    "January": "1", "February": "2", "March": "3", "April": "4", "May": "5", "June": "6",
                    "July": "7", "August": "8", "September": "9", "October": "10", "November": "11", "December": "12",
                    "Jan": "1", "Feb": "2", "Mar": "3", "Apr": "4", "Jun": "6", "Jul": "7", "Aug": "8", "Sep": "9", "Oct": "10", "Nov": "11", "Dec": "12"
                 };
                 
                 if (val && monthNameMap[val]) {
                    const targetMonth = parseInt(monthNameMap[val]);
                    // If target month is greater than current month, assume it's from last year
                    // e.g., We are in Feb (2), target is Oct (10) -> Oct must be last year
                    const targetYear = targetMonth > currentMonth ? currentYear - 1 : currentYear;
                    
                    filterValue = `${targetMonth}/${targetYear}`;
                 } else {
                    if (val) filterValue = val;
                 }
             }
        }
        else if (timeFilter === "Day") {
             // If we don't have a structured date, but have a day name "Mon", "Tue"
             // It's ambiguous which date it is unless backend provides it.
             // However, for UX, if backend fails to provide full date but provides day, 
             // we might currently be failing to set filterValue, so user can't click.
             // If api response is missing 'date', we might not be able to filter precisely.
             // But if we have 'label' or 'day', let's use it as a last resort fallback.
             const val = label || day;
             if (val) filterValue = val; 
        }
      }

      return {
        date: displayDate,
        count: d.count || 0,
        filterValue: filterValue // This will be passed to onSelectDate
      };
    }) || [],

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
        {(() => {
            let label = "";
            let trend = "vs yesterday";
            if (timeFilter === "Day") { label = "(Today)"; trend = "vs yesterday"; }
            else if (timeFilter === "Week") { label = "(This Week)"; trend = "vs last week"; }
            else if (timeFilter === "Month") { label = "(This Month)"; trend = "vs last month"; }
            else if (timeFilter === "Year") { label = "(This Year)"; trend = "vs last year"; }
            
            // If filtering by specific date, maybe clarify? For now, stick to the main filter label.
            
            return (
                <StatsCard
                title={`Total Meals Served ${label}`}
                value={stats.totalMeals}
                // Assuming the API might return relevant comparison data later
                currentDay={stats.totalMeals} 
                lastDayCount={0}
                trendLabel={trend}
                />
            );
        })()}

        {/* Top Scanner Users */}
        <TopScanners data={stats.topScanners} />

        {/* Lunch VS Supper */}
        <LunchVsSupper data={stats.lunchVsSupperData} />

        {/* Daily Meals Logs & Meals Served By Branch */}
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyMealsChart 
            data={stats.dailyLogsData} 
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date === selectedDate ? null : date)}
          />
          <MealsByBranchTable
            data={stats.branchStats}
            resolveBranchName={enhancedResolveBranchName}
            dailyLogsData={stats.dailyLogsData}
            selectedDate={selectedDate}
            onDateSelect={(date) => setSelectedDate(date)}
            timeFilter={timeFilter}
            loading={isRefetching}
          />
        </div>
      </div>
    </div>
  );
};
