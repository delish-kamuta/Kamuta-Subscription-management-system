import { SidebarTrigger } from "~/components/ui/sidebar"
import { Header } from "../../../components/Header"
const payments = () => {
  return (
        <main className='dashboard wrapper'>
          <Header title="Manage all Payments" description="Manage all subscription without any error"
          action={<SidebarTrigger className="rounded-md p-1 border border-transparent  md:border-slate-200" />} />
          dashboard details
        </main>
  )
}

export default payments
