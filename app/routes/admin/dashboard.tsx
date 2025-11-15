import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import StatsCard from "../../../components/StatsCard";
import SubscriptionsChart from "../../../components/SubscriptionsChart";
import MealsBarChart from "../../../components/MealsBarChart";
import RemainingMealsPieChart from "../../../components/RemainingMealsPieChart";
import { dashboardStats, user } from "app/constants";

const Dashboard = () => {
  return (
    <main className="dashboard wrapper">
      <Header
        title={`Welcome ${user?.name ? user.name : "Guest"} 🤚`}
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

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Subscriptions Chart */}
        <SubscriptionsChart />

        {/* Meals Bar Chart */}
        <MealsBarChart />
      </section>

      {/* Remaining Meals Overview */}
      <section className="mt-6">
        <RemainingMealsPieChart />
      </section>
    </main>
  );
};

export default Dashboard;
