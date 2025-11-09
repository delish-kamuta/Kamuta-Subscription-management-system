import { Header } from "../../../components/Header";
import  StatsCard  from "../../../components/StatsCard";
import SubscriptionsTable from "../../../components/SubscriptionsTable";
import { dashboardStats ,user } from "app/constants";
const Dashboard = () => {

  return (
    <main className='dashboard wrapper '>
      <Header title={`Welcome ${user?.name ? user.name : 'Guest'} 🤚`} description="Manage all subscription without any error"/>
      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {dashboardStats.map((stat) => (
            <StatsCard key={stat.id} title={stat.title} value={stat.value} currentDay={stat.currentDay} lastDayCount={stat.lastDayCount} />
          ))}

        </div>

      </section>

      <SubscriptionsTable />
    </main>
  )
}

export default Dashboard
