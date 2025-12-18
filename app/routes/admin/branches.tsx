import { Header } from "../../../components/Header"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Skeleton } from "~/components/ui/skeleton"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useAppSelector, useAppDispatch } from "~/store/hooks"
import { fetchBranchesThunk, addBranchOptimistic, updateBranchOptimistic, removeBranchOptimistic } from "~/store/branchesSlice"
import type { BranchItem } from "~/store/branchesSlice"
import { createBranch, updateBranch, deleteBranch } from "~/services/branches"
import { AddBranchSheet } from "../../components/components/AddBranchSheet"
import { UserRole } from "~/types/auth"

export default function BranchesPage() {
  const dispatch = useAppDispatch()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const branchesState = useAppSelector((state) => state.branches)
  const branches = branchesState.items
  const loading = branchesState.loading

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null)
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [branchForm, setBranchForm] = useState({
    name: "",
    campus: "University of Rwanda",
    regular_price: 800,
    vip_price: 1200,
    vvip_price: 1800,
  })

  useEffect(() => {
    if (!branchesState.loaded) {
      dispatch(fetchBranchesThunk())
    }
  }, [])

  const filteredBranches = branches.filter(b => 
    (b.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setFormLoading(true)
    try {
      const payload = {
        name: branchForm.name,
        campus: branchForm.campus,
        regular_price: String(branchForm.regular_price),
        vip_price: String(branchForm.vip_price),
        vvip_price: String(branchForm.vvip_price),
      }
      const res = await createBranch(payload)
      const newBranch = res.data || res
      dispatch(addBranchOptimistic({
        id: String(newBranch.id),
        name: newBranch.name,
        regular_price: Number(newBranch.regular_price),
        vip_price: Number(newBranch.vip_price),
        vvip_price: Number(newBranch.vvip_price),
      }))
      setSuccessMessage("Branch created successfully")
      setTimeout(() => {
        setIsAddOpen(false)
        setSuccessMessage("")
        setBranchForm({
          name: "",
          campus: "University of Rwanda",
          regular_price: 800,
          vip_price: 1200,
          vvip_price: 1800,
        })
      }, 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create branch")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBranch) return
    setError("")
    setSuccessMessage("")
    setFormLoading(true)
    try {
      const payload = {
        name: branchForm.name,
        campus: branchForm.campus,
        regular_price: String(branchForm.regular_price),
        vip_price: String(branchForm.vip_price),
        vvip_price: String(branchForm.vvip_price),
      }
      const res = await updateBranch(selectedBranch.id, payload)
      const updated = res.data || res
      dispatch(updateBranchOptimistic({
        id: selectedBranch.id,
        name: updated.name || branchForm.name,
        regular_price: Number(updated.regular_price || branchForm.regular_price),
        vip_price: Number(updated.vip_price || branchForm.vip_price),
        vvip_price: Number(updated.vvip_price || branchForm.vvip_price),
      }))
      setSuccessMessage("Branch updated successfully")
      setTimeout(() => {
        setIsEditOpen(false)
        setSuccessMessage("")
        setSelectedBranch(null)
      }, 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update branch")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (branch: BranchItem) => {
    if (!confirm(`Are you sure you want to delete ${branch.name}?`)) return
    try {
      await deleteBranch(branch.id)
      dispatch(removeBranchOptimistic(branch.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete branch")
    }
  }

  const openEdit = (branch: BranchItem) => {
    setSelectedBranch(branch)
    setBranchForm({
      name: branch.name || "",
      campus: "University of Rwanda", // Assuming default or we need to fetch it if not in list
      regular_price: branch.regular_price || 0,
      vip_price: branch.vip_price || 0,
      vvip_price: branch.vvip_price || 0,
    })
    setIsEditOpen(true)
  }

  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <main className="wrapper">
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-500">Access Denied: Admin Only</p>
        </div>
      </main>
    )
  }

  return (
    <main className="wrapper">
      <Header
        title="Branch Management"
        description="Manage restaurant branches and pricing"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      <div className="mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search branches..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {
             setBranchForm({
              name: "",
              campus: "University of Rwanda",
              regular_price: 800,
              vip_price: 1200,
              vvip_price: 1800,
            })
            setIsAddOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Branch
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Regular Price</TableHead>
                <TableHead>VIP Price</TableHead>
                <TableHead>VVIP Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && branches.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredBranches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No branches found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.regular_price?.toLocaleString()} RWF</TableCell>
                    <TableCell>{branch.vip_price?.toLocaleString()} RWF</TableCell>
                    <TableCell>{branch.vvip_price?.toLocaleString()} RWF</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(branch)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(branch)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddBranchSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        error={error}
        successMessage={successMessage}
        isLoading={formLoading}
        branchForm={branchForm}
        setBranchForm={setBranchForm}
        onSubmit={handleAdd}
        title="Add New Branch"
        submitLabel="Create Branch"
      />

      <AddBranchSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        error={error}
        successMessage={successMessage}
        isLoading={formLoading}
        branchForm={branchForm}
        setBranchForm={setBranchForm}
        onSubmit={handleEdit}
        title="Edit Branch"
        submitLabel="Update Branch"
      />
    </main>
  )
}
