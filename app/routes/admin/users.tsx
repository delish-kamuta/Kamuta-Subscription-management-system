import { Header } from "../../../components/Header"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { ActionsBar } from "~/components/users/ActionsBar"
import { UsersTable } from "~/components/users/UsersTable"
import { AddUserSheet } from "~/components/users/AddUserSheet"
import { AddBranchSheet } from "~/components/branches/AddBranchSheet"
import { UserRole } from "~/types/auth"
import { useUsersPage } from "~/hooks/useUsersPage"

export default function UsersPage() {
  const {
    currentUser,
    roleState,
    usersLoading,
    isAddUserOpen, setIsAddUserOpen,
    isAddBranchOpen, setIsAddBranchOpen,
    isViewUserOpen, setIsViewUserOpen,
    isEditUserOpen, setIsEditUserOpen,
    selectedUser, setSelectedUser,
    isLoading,
    searchQuery, setSearchQuery,
    error, setError,
    successMessage, setSuccessMessage,
    branches,
    showNewPwdModal, setShowNewPwdModal,
    newPwdValue,
    formData, setFormData,
    branchForm, setBranchForm,
    fetchBranches,
    ensureBranchPresent,
    handleAddUser,
    handleAddBranch,
    handleAdminResetPassword,
    handleDeleteUser,
    handleUpdateUser,
    filteredUsers,
    staticBranches
  } = useUsersPage()

  // Only admins can access this page
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
        title="User Management"
        description="Manage all users in the system"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      <ActionsBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddUser={() => { setIsAddUserOpen(true); fetchBranches(); }}
        onOpenAddBranch={() => setIsAddBranchOpen(true)}
      />

      <UsersTable
        users={filteredUsers}
        isLoading={usersLoading}
        branches={branches}
        onView={(user) => { setSelectedUser(user); setIsViewUserOpen(true); ensureBranchPresent(user.branch_id) }}
        onEdit={(user) => { setSelectedUser(user); setIsEditUserOpen(true); ensureBranchPresent(user.branch_id) }}
        onAdminResetPassword={handleAdminResetPassword}
        onDelete={handleDeleteUser}
      />

      <AddUserSheet
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        error={error}
        action = {"Add User"}
        successMessage={successMessage}
        isLoading={isLoading}
        formData={formData}
        setFormData={setFormData}
        branches={branches}
        staticBranches={staticBranches}
        roles={roleState.roles}
        onSubmit={handleAddUser}
      />

      <AddBranchSheet
        open={isAddBranchOpen}
        onOpenChange={setIsAddBranchOpen}
        error={error}
        successMessage={successMessage}
        isLoading={isLoading}
        branchForm={branchForm}
        setBranchForm={setBranchForm}
        onSubmit={handleAddBranch}
      />

      {/* View User Sheet (read-only using AddUserSheet) */}
      {selectedUser && (
        <AddUserSheet
          open={isViewUserOpen}
          onOpenChange={(v) => { setIsViewUserOpen(v); if (!v) setSelectedUser(null) }}
          error={""}
          action ={"View User"}
          successMessage={""}
          isLoading={false}
          formData={{
            full_name: selectedUser.full_name,
            phone: selectedUser.phone,
            role: selectedUser.role,
            branch_id: selectedUser.branch_id,
            password: '',
            reg_number: selectedUser?.student?.reg_number || ''
          }}
          setFormData={() => {}}
          branches={branches}
          staticBranches={staticBranches}
          roles={roleState.roles}
          onSubmit={(e) => { e.preventDefault(); setIsViewUserOpen(false) }}
        />
      )}

      {/* Edit User Sheet */}
      {selectedUser && (
        <AddUserSheet
          open={isEditUserOpen}
          onOpenChange={(v) => { setIsEditUserOpen(v); if (!v) setSelectedUser(null) }}
          error={error}
          action = {"Edit User"}
          successMessage={successMessage}
          isLoading={isLoading}
          formData={{
            full_name: selectedUser.full_name,
            phone: selectedUser.phone,
            role: selectedUser.role,
            branch_id: selectedUser.branch_id,
            password: '',
            reg_number: selectedUser?.student?.reg_number || ''
          }}
          setFormData={(fd) => {
            if (!selectedUser) return
            setSelectedUser({
              ...selectedUser,
              full_name: fd.full_name,
              phone: fd.phone,
              role: fd.role,
              branch_id: fd.branch_id,
              student: { reg_number: fd.reg_number },
            })
          }}
          branches={branches}
          staticBranches={staticBranches}
          roles={roleState.roles}
          onSubmit={handleUpdateUser}
        />
      )}

      {/* New Password Modal */}
      {showNewPwdModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewPwdModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900">New Password Generated</h3>
            <p className="mt-2 text-sm text-gray-600">Share this temporary password with the user and advise them to change it after login.</p>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={newPwdValue}
                className="flex-1 border rounded-md px-3 py-2 font-mono text-sm"
              />
              <button
                type="button"
                className="px-3 py-2 text-sm rounded-md border border-slate-200 hover:bg-slate-50"
                onClick={() => {
                  navigator.clipboard?.writeText?.(newPwdValue)
                }}
                title="Copy password"
              >Copy</button>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border border-slate-200 hover:bg-slate-50"
                onClick={() => setShowNewPwdModal(false)}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
