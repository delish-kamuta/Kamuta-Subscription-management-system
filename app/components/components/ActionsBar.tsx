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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <Button onClick={onOpenAddUser} className="bg-primary-100 hover:bg-primary-100/90 flex-1">
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
