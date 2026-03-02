import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import  StatsCard  from "../../../components/StatsCard";
import { dashboardStats, subscriptionData } from "app/constants";
import { ChartPieSimple } from "../../../components/pie-chart";
import { ChartBarMultiple} from "../../../components/BarChart";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import Client from "components/client";
import { listMealLogs, type MealLogItem } from "~/services/mealLogs";
import { getOverviewStats, getDashboardOverview, type MonthlyData } from "~/services/overview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { UserRole } from "~/types/auth";
import QuickAction from "../../../components/Quick-action"
import ResetPasswordButton from "../../../components/ResetPasswordButton"
import SubscriptionTable from "~/components/subscriptions/SubscriptionTable";
import { toDateKey } from "~/lib/date";
import { fetchSubscriptions } from "~/store/subscriptionsSlice";
import { Button } from "~/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useDashboardView } from "~/hooks/useDashboardView";


const Dashboard = () => {
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: subscriptions } = useAppSelector((state) => state.subscriptions);
  
  const userName = user?.name || "Guest";
  const userRole = user?.role;
  const isCashier = userRole === UserRole.CASHIER;
  const isAdmin = userRole === UserRole.ADMIN;

  // Use shared dashboard view context
  const { activeView, toggleView } = useDashboardView();

  const [stats, setStats] = useState<{
    id: string;
    title: string;
    value: string | number;
    currentDay: string | number;
    lastDayCount: string | number;
  }[]>(dashboardStats);

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [mealUsageSummary, setMealUsageSummary] = useState<{ zero: number; low: number; plenty: number }>({ zero: 0, low: 0, plenty: 0 });

  // Management dashboard mock data
  const managementStats = [
    {
      id: "stockValue",
      title: "Current Stock Value(RWF)",
      value: "12,450",
      currentDay: 12450,
      lastDayCount: 11116,
      trendLabel: "vs last month",
    },
    {
      id: "todayIngredient",
      title: "Today's Ingredient(RWF)",
      value: "3,210",
      currentDay: 3210,
      lastDayCount: 3275,
      trendLabel: "vs last month",
    },
    {
      id: "revenueToday",
      title: "Revenue Today(RWF)",
      value: "520",
      currentDay: 520,
      lastDayCount: 510,
      trendLabel: "vs last month",
    }
  ];

  const alerts = [
    {
      id: 1,
      item: "Rice",
      quantity: "8kg",
      threshold: "10kg",
    },
    {
      id: 2,
      item: "Cooking Oil",
      quantity: "2L",
      threshold: "10L",
    }
  ];

  useEffect(() => {
    if (isAdmin) {
      // 1. Fetch Overview Stats (Cards)
      getOverviewStats({ time_range: 'today' })
        .then((res) => {
          if (res.success && res.data) {
            const apiData = res.data;
            const newStats = dashboardStats.map(stat => {
              if (stat.id === 'totalIncome') {
                return { 
                  ...stat, 
                  value: apiData.summary?.total_revenue?.current || 0,
                  currentDay: apiData.summary?.total_revenue?.current || 0,
                  lastDayCount: apiData.summary?.total_revenue?.previous || 0
                };
              }
              if (stat.id === 'totalCredit') {
                return { 
                  ...stat, 
                  value: apiData.summary?.total_credit_used || 0,
                  currentDay: apiData.summary?.total_credit_used || 0,
                  lastDayCount: apiData.summary?.total_credit_used || 0
                };
              }
              if (stat.id === 'mealsServedToday') {
                return { 
                  ...stat, 
                  value: apiData.summary?.total_meals?.current || 0,
                  currentDay: apiData.summary?.total_meals?.current || 0,
                  lastDayCount: apiData.summary?.total_meals?.previous || 0
                };
              }
              return stat;
            });
            setStats(newStats);
          }
        })
        .catch(err => console.error("Failed to fetch overview stats", err));

      // 2. Fetch Dashboard Overview (Charts)
      getDashboardOverview()
        .then((res) => {
           if (res.success && res.data) {
             const chartData = res.data;
             if (chartData.monthly_data) {
               setMonthlyData(chartData.monthly_data);
             }
             if (chartData.summary) {
               setMealUsageSummary({
                 zero: chartData.summary.students_zero_meals || 0,
                 low: chartData.summary.students_low_meals || 0,
                 plenty: chartData.summary.students_plenty_meals || 0
               });
             }
           }
        })
        .catch(err => console.error("Failed to fetch dashboard overview", err));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isCashier && token) {
      dispatch(fetchSubscriptions({ token }));
    }
  }, [isCashier, token, dispatch]);

  // Compute recent subscriptions (latest by dateStarted)
  const recentSubscriptions = useMemo(() => {
    return [...subscriptions]
      .sort((a, b) => (toDateKey(b.dateStarted) ?? 0) - (toDateKey(a.dateStarted) ?? 0))
      .slice(0, 8);
  }, [subscriptions]);

  // Client (Student/Worker) Dashboard with real data + recent meal logs
  const [myLogs, setMyLogs] = useState<MealLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === UserRole.STUDENT) {
      setLogsLoading(true);
      setLogsError(null);
      const clientId = String(user?.id || "");
      listMealLogs({ client_user_id: clientId })
        .then((res) => {
          if (!res.success) { setLogsError(res.message || "Failed to load meal logs"); setMyLogs([]); return; }
          setMyLogs(res.data || []);
        })
        .catch((e) => setLogsError(String(e?.message || e)))
        .finally(() => setLogsLoading(false));
    }
  }, [userRole, user]);

  useEffect(() => {
    if (userRole === UserRole.WORKER) {
      navigate('/chef-dashboard');
    }
  }, [userRole, navigate]);

  if (userRole === UserRole.WORKER) return null;

  if (userRole === UserRole.STUDENT) {
    return (
      <main className='dashboard wrapper'>
        {/* Client view handles its own welcome header; avoid duplicate */}
        <section className="flex flex-col gap-6">
          <Client userName={userName} />
        </section>
      </main>
    );
  }

  // Admin/Staff Dashboard
  return (
    <main className='dashboard wrapper'>
      <Header
        title={activeView === 'management' ? "Management  Overview" : `Welcome ${userName} 🤚`}
        description="Track activity, trends, and popular destinations in real time"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      {/* Overview Dashboard */}
      {(activeView === 'overview' || !isAdmin) && (
        <>
          {/* Stats Cards Section */}
          <section className="flex flex-col gap-6">
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {stats.map((stat) => (
                  <StatsCard
                    key={stat.id}
                    title={stat.title}
                    value={stat.value}
                    currentDay={stat.currentDay}
                    lastDayCount={stat.lastDayCount}
                  />
                ))}
              </div>
            )}

            {(isCashier || isAdmin)&&(<QuickAction/>)}

          </section>
          {isCashier ? (
            <section className="mt-6 bg-white rounded-lg shadow-sm">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Recent Subscriptions</h2>
                <p className="text-sm text-gray-500">Latest subscription activity</p>
              </div>
              <SubscriptionTable items={recentSubscriptions as any} isCashier={true} />
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <ChartBarMultiple data={monthlyData} />
              <ChartPieSimple data={mealUsageSummary} />
            </section>
          )}
        </>
      )}

      {/* Management Dashboard (Admin only) */}
      {activeView === 'management' && isAdmin && (
        <>
          {/* Management Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {managementStats.map((stat) => (
              <StatsCard
                key={stat.id}
                title={stat.title}
                value={stat.value}
                currentDay={stat.currentDay}
                lastDayCount={stat.lastDayCount}
                trendLabel={stat.trendLabel}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <h3 className="text-lg font-bold text-gray-900 mt-2">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm w-full" onClick={() => navigate("/dairy-usage-report")}>
              Dairy Usage Report
            </Button>
            <Button className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm w-full" onClick={() => navigate("/manage-stock")}>
              Manage Stock
            </Button>
            <Button className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm w-full" onClick={() => navigate("/manage-chefs")}>
              Manage Chefs
            </Button>
            <Button className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm w-full" onClick={() => navigate("/view-profit-report")}>
              View Profit Report
            </Button>
          </div>

          {/* Alerts Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4 mt-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-gray-900">
                  <AlertTriangle className="h-5 w-5 text-orange-400 fill-orange-50 stroke-orange-500" />
                  <span className="font-semibold">
                    {alert.item}: {alert.quantity} <span className="font-normal text-gray-500">(below {alert.threshold})</span>
                  </span>
                </div>
                <Button variant="outline" className="bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A] hover:bg-[#FEF08A] font-medium px-6">
                  Refill Stock
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
};
export default Dashboard;
