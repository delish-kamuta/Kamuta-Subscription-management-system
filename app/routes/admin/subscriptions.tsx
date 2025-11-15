import { Header } from '../../../components/Header'
import { SidebarTrigger } from '~/components/ui/sidebar'
const subscriptions = () => {
  return (
<main className='dashboard wrapper'>
      <Header title="Manage all Subscriptions" description="Manage all subscription without any error"
      action={<SidebarTrigger className="rounded-md p-1 border border-transparent  md:border-slate-200" />} />
      Subscription management coming soon
    </main>
  )
}

export default subscriptions
