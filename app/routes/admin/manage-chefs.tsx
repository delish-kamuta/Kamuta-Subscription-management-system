import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { useAppSelector, useAppDispatch } from "~/store/hooks";
import { fetchUsersThunk } from "~/store/usersSlice";
import { fetchBranchesThunk, removeBranchOptimistic } from "~/store/branchesSlice";
import { deleteBranch } from "~/services/branches";
import { AddUserSheet } from "~/components/users/AddUserSheet";
import { AddBranchSheet } from "~/components/branches/AddBranchSheet";
import { useUserActions } from "~/hooks/useUserActions";
import { useUserForm } from "~/hooks/useUserForm";
import { useBranchForm } from "~/hooks/useBranchForm";
import type { User } from "~/types/users";
import { UserRole } from "~/types/auth";
import { apiClient } from "~/lib/api";

export default function ManageChefsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // State
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const usersState = useAppSelector((state) => state.users);
  const branchesState = useAppSelector((state) => state.branches);

  const users = (Array.isArray(usersState.items) ? usersState.items : []) as User[];
  const branches = branchesState.items;
  
  const [isAddChefOpen, setIsAddChefOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [branchOptions, setBranchOptions] = useState<{id: string, name: string}[]>([]);

  // Filter for Chefs (Workers)
  const chefs = users.filter((u) => u.role.toLowerCase() === "worker");

  // Load Data
  useEffect(() => {
    if (!usersState.loaded) dispatch(fetchUsersThunk());
    if (!branchesState.loaded) dispatch(fetchBranchesThunk());
    
    // Convert branches state to options for forms
    const options = branches.map(b => ({id: b.id || b.name || "", name: b.name || ""}));
    setBranchOptions(options);

    // If branches empty in state, try fetch manually to populate options if needed, 
    // but branchesState should cover it.
  }, [dispatch, usersState.loaded, branchesState.loaded, branches]);


  // Hooks for Actions
  const { formData, setFormData, handleAddUser } = useUserForm(
    branchOptions,
    setSuccessMessage,
    setError,
    setLoading,
    setIsAddChefOpen
  );

  const { handleDeleteUser } = useUserActions(
    null,
    setSuccessMessage,
    setError,
    setLoading,
    () => {} // No edit modal to close
  );

  // Handle Branch Deletion
  const handleDeleteBranch = async (branchId: string) => {
      if (!confirm("Are you sure you want to delete this branch? This action cannot be undone.")) return;

      try {
          setLoading(true);
          // Optimistic update
          dispatch(removeBranchOptimistic(branchId));
          
          await deleteBranch(branchId);
          setSuccessMessage("Branch deleted successfully");
      } catch (err: any) {
          setError(err.message || "Failed to delete branch");
          // Revert optimistic update ideally, but full refresh for now
          dispatch(fetchBranchesThunk());
      } finally {
          setLoading(false);
      }
  };


  // Override default form role to 'worker' when opening
  const openAddChef = () => {
    setFormData({
      ...formData,
      role: "worker", // Default to worker for 'Chef'
    });
    setIsAddChefOpen(true);
  };


  return (
    <main className="wrapper flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col items-center gap-4">
          <Header
            title="Manage Chefs & Branches"
            description="Create chefs and manage restaurant branches"
            action={
              <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
            }
          />
            <div className="w-full p-0">
            <Button variant="ghost" size="icon" className="w-full flex justify-start" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
              <span className="text-bold">Return To Dashboard</span>
          </Button>
            </div>
      </div>

      {/* Chefs Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Chefs</h2>
          <Button onClick={openAddChef} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 text-white" />
            <span className="text-white">Add Chef</span>
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && chefs.length === 0 ? (
                 Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                 ))
              ) : chefs.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No chefs found. Add one to get started.
                    </TableCell>
                </TableRow>
              ) : (
                chefs.map((chef) => (
                    <TableRow key={chef.id}>
                        <TableCell className="font-medium">{chef.full_name}</TableCell>
                        <TableCell>{chef.phone}</TableCell>
                        <TableCell>{branchOptions.find(b => b.id === chef.branch_id)?.name || chef.branch_id || "N/A"}</TableCell>
                        <TableCell className="text-right">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                    if(confirm(`Delete chef ${chef.full_name}?`)) {
                                        handleDeleteUser(chef);
                                    }
                                }}
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                        </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
      {/* Add Chef Sheet */}
      <AddUserSheet
        open={isAddChefOpen}
        onOpenChange={setIsAddChefOpen}
        error={error}
        successMessage={successMessage}
        isLoading={loading}
        action="Add Chef"
        formData={formData}
        setFormData={setFormData}
        branches={branchOptions}
        staticBranches={branchOptions}
        roles={[{ name: 'worker' }]} // Restrict roles to Worker (Chef)
        onSubmit={handleAddUser}
      />
    </main>
  );
}
