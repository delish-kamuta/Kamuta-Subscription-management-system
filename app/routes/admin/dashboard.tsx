import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import  StatsCard  from "../../../components/StatsCard";
import SubscriptionsTable from "../../../components/SubscriptionsTable";
import { dashboardStats } from "app/constants";
import { ChartPieSimple } from "../../../components/pie-chart";
import { ChartBarMultiple} from "../../../components/BarChart";
import { useEffect, useState } from "react";
import Client from "components/client";


const Dashboard = () => {
  const [userName, setUserName] = useState<string>("Guest");
  const [userRole, setUserRole] = useState<"client" | "cashier" | "scanner" | "admin">("client");

  useEffect(() => {
    // TODO: Get user role from authentication context
    // For now, using static role - replace with actual auth
    const role = "cashier"; // Change this based on logged-in user
    setUserRole(role as any);
    setUserName(role);
  }, []);

  // Client (Student) Dashboard
  if (userRole === "client") {
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
      </section>
      <section className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <ChartBarMultiple />
        <ChartPieSimple />
      </section>
    </main>
  )
};
export default Dashboard;
