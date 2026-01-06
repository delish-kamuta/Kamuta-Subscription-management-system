import { Header } from "../../../components/Header"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Skeleton } from "~/components/ui/skeleton"
import { Search, Plus, Edit, Trash2, ChevronDown } from "lucide-react"
import { useAppSelector, useAppDispatch } from "~/store/hooks"
import { fetchBranchesThunk, addBranchOptimistic, updateBranchOptimistic, removeBranchOptimistic } from "~/store/branchesSlice"
import type { BranchItem } from "~/store/branchesSlice"
import { createBranch, updateBranch, deleteBranch } from "~/services/branches"
import { AddBranchSheet } from "~/components/branches/AddBranchSheet"
import { BranchPerformance } from "~/components/branches/BranchPerformance"
import { UserRole } from "~/types/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

export default function BranchesPage() {
  const dispatch = useAppDispatch()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const branchesState = useAppSelector((state) => state.branches)
  const branches = branchesState.items
  const loading = branchesState.loading

  const [activeTab, setActiveTab] = useState<'performance' | 'pricing'>('performance')
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null)
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<BranchItem | null>(null)
  const [timeRange, setTimeRange] = useState("This Week")
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [branchForm, setBranchForm] = useState({
    name: "",
    campus: "University of Rwanda",
    student_regular_price: 0,
    student_vip_price: 0,
    student_vvip_price: 0,
    worker_regular_price: 2000,
    worker_vip_price: 2000,
    worker_vvip_price: 2000,
    irregular_student_regular_price: 800,
    irregular_student_vip_price: 1200,
    irregular_student_vvip_price: 1600,
    irregular_worker_regular_price: 1000,
    irregular_worker_vip_price: 1500,
    irregular_worker_vvip_price: 2000,
  })

  useEffect(() => {
    if (!branchesState.loaded) {
      dispatch(fetchBranchesThunk())
    }
  }, [])

  const filteredBranches = branches.filter(b => 
    (b.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => Number(b.id) - Number(a.id))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setFormLoading(true)
    try {
      const payload = {
        name: branchForm.name,
        campus: branchForm.campus,
        student_regular_price: Number(branchForm.student_regular_price),
        student_vip_price: Number(branchForm.student_vip_price),
        student_vvip_price: Number(branchForm.student_vvip_price),
        worker_regular_price: Number(branchForm.worker_regular_price),
        worker_vip_price: Number(branchForm.worker_vip_price),
        worker_vvip_price: Number(branchForm.worker_vvip_price),
        irregular_student_regular_price: Number(branchForm.irregular_student_regular_price),
        irregular_student_vip_price: Number(branchForm.irregular_student_vip_price),
        irregular_student_vvip_price: Number(branchForm.irregular_student_vvip_price),
        irregular_worker_regular_price: Number(branchForm.irregular_worker_regular_price),
        irregular_worker_vip_price: Number(branchForm.irregular_worker_vip_price),
        irregular_worker_vvip_price: Number(branchForm.irregular_worker_vvip_price),
      }
      const res = await createBranch(payload)
      const newBranch = res.data || res
      dispatch(addBranchOptimistic({
        id: String(newBranch.id),
        name: newBranch.name,
        campus: newBranch.campus,
        student_regular_price: Number(newBranch.student_regular_price),
        student_vip_price: Number(newBranch.student_vip_price),
        student_vvip_price: Number(newBranch.student_vvip_price),
        worker_regular_price: Number(newBranch.worker_regular_price),
        worker_vip_price: Number(newBranch.worker_vip_price),
        worker_vvip_price: Number(newBranch.worker_vvip_price),
        irregular_student_regular_price: Number(newBranch.irregular_student_regular_price),
        irregular_student_vip_price: Number(newBranch.irregular_student_vip_price),
        irregular_student_vvip_price: Number(newBranch.irregular_student_vvip_price),
        irregular_worker_regular_price: Number(newBranch.irregular_worker_regular_price),
        irregular_worker_vip_price: Number(newBranch.irregular_worker_vip_price),
        irregular_worker_vvip_price: Number(newBranch.irregular_worker_vvip_price),
      }))
      setSuccessMessage("Branch created successfully")
      setTimeout(() => {
        setIsAddOpen(false)
        setSuccessMessage("")
        setBranchForm({
          name: "",
          campus: "University of Rwanda",
          student_regular_price: 0,
          student_vip_price: 0,
          student_vvip_price: 0,
          worker_regular_price: 2000,
          worker_vip_price: 2000,
          worker_vvip_price: 2000,
          irregular_student_regular_price: 800,
          irregular_student_vip_price: 1200,
          irregular_student_vvip_price: 1600,
          irregular_worker_regular_price: 1000,
          irregular_worker_vip_price: 1500,
          irregular_worker_vvip_price: 2000,
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
        student_regular_price: Number(branchForm.student_regular_price),
        student_vip_price: Number(branchForm.student_vip_price),
        student_vvip_price: Number(branchForm.student_vvip_price),
        worker_regular_price: Number(branchForm.worker_regular_price),
        worker_vip_price: Number(branchForm.worker_vip_price),
        worker_vvip_price: Number(branchForm.worker_vvip_price),
        irregular_student_regular_price: Number(branchForm.irregular_student_regular_price),
        irregular_student_vip_price: Number(branchForm.irregular_student_vip_price),
        irregular_student_vvip_price: Number(branchForm.irregular_student_vvip_price),
        irregular_worker_regular_price: Number(branchForm.irregular_worker_regular_price),
        irregular_worker_vip_price: Number(branchForm.irregular_worker_vip_price),
        irregular_worker_vvip_price: Number(branchForm.irregular_worker_vvip_price),
      }
      const res = await updateBranch(selectedBranch.id, payload)
      const updated = res.data || res
      dispatch(updateBranchOptimistic({
        id: selectedBranch.id,
        name: updated.name || branchForm.name,
        campus: updated.campus || branchForm.campus,
        student_regular_price: Number(updated.student_regular_price ?? branchForm.student_regular_price),
        student_vip_price: Number(updated.student_vip_price ?? branchForm.student_vip_price),
        student_vvip_price: Number(updated.student_vvip_price ?? branchForm.student_vvip_price),
        worker_regular_price: Number(updated.worker_regular_price ?? branchForm.worker_regular_price),
        worker_vip_price: Number(updated.worker_vip_price ?? branchForm.worker_vip_price),
        worker_vvip_price: Number(updated.worker_vvip_price ?? branchForm.worker_vvip_price),
        irregular_student_regular_price: Number(updated.irregular_student_regular_price ?? branchForm.irregular_student_regular_price),
        irregular_student_vip_price: Number(updated.irregular_student_vip_price ?? branchForm.irregular_student_vip_price),
        irregular_student_vvip_price: Number(updated.irregular_student_vvip_price ?? branchForm.irregular_student_vvip_price),
        irregular_worker_regular_price: Number(updated.irregular_worker_regular_price ?? branchForm.irregular_worker_regular_price),
        irregular_worker_vip_price: Number(updated.irregular_worker_vip_price ?? branchForm.irregular_worker_vip_price),
        irregular_worker_vvip_price: Number(updated.irregular_worker_vvip_price ?? branchForm.irregular_worker_vvip_price),
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
      campus: branch.campus || "University of Rwanda",
      student_regular_price: branch.student_regular_price || 0,
      student_vip_price: branch.student_vip_price || 0,
      student_vvip_price: branch.student_vvip_price || 0,
      worker_regular_price: branch.worker_regular_price || 0,
      worker_vip_price: branch.worker_vip_price || 0,
      worker_vvip_price: branch.worker_vvip_price || 0,
      irregular_student_regular_price: branch.irregular_student_regular_price || 0,
      irregular_student_vip_price: branch.irregular_student_vip_price || 0,
      irregular_student_vvip_price: branch.irregular_student_vvip_price || 0,
      irregular_worker_regular_price: branch.irregular_worker_regular_price || 0,
      irregular_worker_vip_price: branch.irregular_worker_vip_price || 0,
      irregular_worker_vvip_price: branch.irregular_worker_vvip_price || 0,
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex space-x-0 rounded-lg border border-slate-200 bg-white p-0 overflow-hidden">
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === 'performance'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Performance
            </button>
            <div className="w-px bg-slate-200"></div>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === 'pricing'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Pricing
            </button>
          </div>

          {activeTab === 'performance' && (
            <div className="flex gap-2">
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white border-gray-200 h-9 gap-2 min-w-[120px] justify-between">
                    {selectedBranchFilter?.name || "All Branch"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] bg-white border-gray-200">
                  <DropdownMenuItem onClick={() => setSelectedBranchFilter(null)}>
                    All Branch
                  </DropdownMenuItem>
                  {branches.map((branch) => (
                    <DropdownMenuItem key={branch.id} onClick={() => setSelectedBranchFilter(branch)}>
                      {branch.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu> */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white border-gray-200 h-9 gap-2 min-w-[120px] justify-between">
                    {timeRange} 
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[150px] bg-white border-gray-200">
                  <DropdownMenuItem onClick={() => setTimeRange("Today")}>
                    <div className="flex justify-between w-full items-center">
                      <span>Day</span>
                      <span className="text-xs text-muted-foreground">D</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange("This Week")}>
                    <div className="flex justify-between w-full items-center">
                      <span>Week</span>
                      <span className="text-xs text-muted-foreground">W</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange("This Month")}>
                    <div className="flex justify-between w-full items-center">
                      <span>Month</span>
                      <span className="text-xs text-muted-foreground">M</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange("This Year")}>
                    <div className="flex justify-between w-full items-center">
                      <span>Year</span>
                      <span className="text-xs text-muted-foreground">Y</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {activeTab === 'performance' ? (
          <BranchPerformance 
            branchId={selectedBranchFilter?.id} 
            timeRange={timeRange} 
          />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
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
                  student_regular_price: 0,
                  student_vip_price: 0,
                  student_vvip_price: 0,
                  worker_regular_price: 2000,
                  worker_vip_price: 2000,
                  worker_vvip_price: 2000,
                  irregular_student_regular_price: 800,
                  irregular_student_vip_price: 1200,
                  irregular_student_vvip_price: 1600,
                  irregular_worker_regular_price: 1000,
                  irregular_worker_vip_price: 1500,
                  irregular_worker_vvip_price: 2000,
                })
                setIsAddOpen(true)
              }} className="bg-blue-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Branch
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-2 text-sm text-gray-500   bg-gray-50/50 flex w-full justify-end gap-2">
                  Found <span className="font-medium text-green-600">{filteredBranches.length}</span> branches
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Student (Reg/VIP/VVIP)</TableHead>
                    <TableHead>Worker (Reg/VIP/VVIP)</TableHead>
                    <TableHead>Irr. Student (Reg/VIP/VVIP)</TableHead>
                    <TableHead>Irr. Worker (Reg/VIP/VVIP)</TableHead>
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
                        <TableCell>
                          {branch.student_regular_price?.toLocaleString()} / {branch.student_vip_price?.toLocaleString()} / {branch.student_vvip_price?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {branch.worker_regular_price?.toLocaleString()} / {branch.worker_vip_price?.toLocaleString()} / {branch.worker_vvip_price?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {branch.irregular_student_regular_price?.toLocaleString()} / {branch.irregular_student_vip_price?.toLocaleString()} / {branch.irregular_student_vvip_price?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {branch.irregular_worker_regular_price?.toLocaleString()} / {branch.irregular_worker_vip_price?.toLocaleString()} / {branch.irregular_worker_vvip_price?.toLocaleString()}
                        </TableCell>
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
          </>
        )}
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
