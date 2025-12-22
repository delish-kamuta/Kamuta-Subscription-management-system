import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Plus, Search } from "lucide-react"

type Props = {
  searchQuery: string
  onSearchChange: (v: string) => void
  onOpenAddUser: () => void
  onOpenAddBranch: () => void
}

export function ActionsBar({ searchQuery, onSearchChange, onOpenAddUser, onOpenAddBranch }: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      <div className="relative w-full md:w-96">
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <Button onClick={onOpenAddUser} className="bg-primary-100 hover:bg-primary-100/90 flex-1 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
        <Button onClick={onOpenAddBranch} variant="outline" className="flex-1">
          Add Branch
        </Button>
      </div>
    </div>
  )
}
