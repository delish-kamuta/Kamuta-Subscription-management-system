import { Header } from "components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import StatsCard from "components/StatsCard"
interface props {
    userName:String
}
const Client = ({userName}:props) => {
  return (
      <main className='dashboard wrapper'>
        <Header
          title={`Welcome ${userName} 👋`}
          description="View your meal subscription and remaining meals"
          action={
            <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
          }
        />

        {/* Student Stats Section */}
        <section className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <StatsCard
              title="Active Subscriptions"
              value={15}
              currentDay={15}
              lastDayCount={20}
            />
            <StatsCard
              title="Meals Remaining"
              value={30}
              currentDay={30}
              lastDayCount={30}
            />
          </div>
        </section>

        {/* Student subscription info */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">My Subscription</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Type:</span> VIP</p>
            <p><span className="font-medium">Total Meals:</span> 30</p>
            <p><span className="font-medium">Remaining:</span> 15</p>
            <p><span className="font-medium">Payment Status:</span> Paid</p>
          </div>
        </section>
      </main>
    );
}

export default Client
