import { SidebarTrigger } from '~/components/ui/sidebar'
import {Header} from '../../../components/Header'
const Settings = () => {
  return (
    <main className='dashboard wrapper'>
      <Header title="Manage all settings" description="Manage all subscription without any error"
      action={<SidebarTrigger className="rounded-md p-1 border border-transparent  md:border-slate-200" />} />
      Settings
    </main>
  )
}

export default Settings
