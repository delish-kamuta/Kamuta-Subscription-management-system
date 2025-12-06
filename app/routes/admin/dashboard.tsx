import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import  StatsCard  from "../../../components/StatsCard";
import { dashboardStats, subscriptionData } from "app/constants";
import { ChartPieSimple } from "../../../components/pie-chart";
import { ChartBarMultiple} from "../../../components/BarChart";
import { useEffect, useState } from "react";
import Client from "components/client";
import { useAppSelector } from "~/store/hooks";
import { UserRole } from "~/types/auth";
import QuickAction from "../../../components/Quick-action"
import SubscriptionTable from "~\/components\/subscriptions\/SubscriptionTable";
import { toDateKey } from "~\/lib\/date";


const Dashboard = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const userName = user?.name || "Guest";
  const userRole = user?.role;
  const isCashier = userRole === UserRole.CASHIER;

  // Compute recent subscriptions (latest by dateStarted)
  const recentSubscriptions = [...subscriptionData]
    .sort((a, b) => (toDateKey(b.dateStarted) ?? 0) - (toDateKey(a.dateStarted) ?? 0))
    .slice(0, 8);

  // Client (Student) Dashboard
  if (userRole === UserRole.CLIENT) {
    return(
      <Client userName={userName} />
    )
  }

  // Admin/Staff Dashboard
  return (
    <main className='dashboard wrapper'>
      <Header
        title={`Welcome ${userName} 🤚`}
        description="Track activity, trends, and popular destinations in real time"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      {/* Stats Cards Section */}
      <section className="flex flex-col gap-6">
        {userRole === UserRole.CASHIER ?
        <QuickAction/>:
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {dashboardStats.map((stat) => (
            <StatsCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              currentDay={stat.currentDay}
              lastDayCount={stat.lastDayCount}
            />
          ))}
        </div>
}
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
          <ChartBarMultiple />
          <ChartPieSimple />
        </section>
      )}
    </main>
  )
};
export default Dashboard;
