import { Header } from "../../../components/Header"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { useAppSelector } from "~/store/hooks"
import ResetPasswordButton from "../../../components/ResetPasswordButton"

export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth)

  return (
    <main className="dashboard wrapper">
      <Header
        title="My Profile"
        description="Manage your account information and password"
        action={
          <div className="flex items-center gap-2">
            <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
          </div>
        }
      />

      <section className="bg-white p-6 rounded-lg shadow mt-4">
        <h2 className="text-lg font-semibold">Account Info</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Full name</p>
            <p className="font-medium">{user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{(user as any)?.email || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Role</p>
            <p className="font-medium">{user?.role || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Branch</p>
            <p className="font-medium">{(user as any)?.branch_id || '—'}</p>
          </div>
        </div>
        <div className="mt-6">
          <ResetPasswordButton />
        </div>
      </section>
    </main>
  )
}
