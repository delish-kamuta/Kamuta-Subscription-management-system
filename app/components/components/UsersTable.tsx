import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Skeleton } from "~/components/ui/skeleton"

export interface UserRow {
  id: string
  full_name: string
  phone: string
  role: string
  created_at: string
  branch_id: string
  reg_number?: string
  student?: {
    reg_number?: string
  }
}

type Props = {
  users: UserRow[]
  isLoading?: boolean
  onView?: (user: UserRow) => void
  onEdit?: (user: UserRow) => void
  onDelete?: (user: UserRow) => void
  onAdminResetPassword?: (user: UserRow) => void
}

export function UsersTable({ users, isLoading = false, onView, onEdit, onDelete, onAdminResetPassword }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingUser, setPendingUser] = useState<UserRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const requestDelete = (user: UserRow) => {
    setPendingUser(user)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!pendingUser) return
    try {
      setIsDeleting(true)
      await Promise.resolve(onDelete?.(pendingUser))
      setConfirmOpen(false)
      setPendingUser(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (isDeleting) return
    setConfirmOpen(false)
    setPendingUser(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Registration Number</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium"><Skeleton className="h-4 w-40 animate-pulse" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32 animate-pulse" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full animate-pulse" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28 animate-pulse" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24 animate-pulse" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-40 animate-pulse ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>{user?.student?.reg_number || '-'}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded-md border border-slate-200 hover:bg-slate-50"
                      onClick={() => onView?.(user)}
                      aria-label={`View ${user.full_name}`}
                    >View</button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded-md border border-slate-200 hover:bg-slate-50"
                      onClick={() => onEdit?.(user)}
                      aria-label={`Edit ${user.full_name}`}
                    >Edit</button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded-md border border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => onAdminResetPassword?.(user)}
                      aria-label={`Admin reset password for ${user.full_name}`}
                    >Reset Password</button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => requestDelete(user)}
                      aria-label={`Delete ${user.full_name}`}
                    >Delete</button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
          <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900">Delete user</h3>
            <p className="mt-2 text-sm text-gray-600">
              {`Are you sure you want to delete${pendingUser ? ` "${pendingUser.full_name}"` : ""}? This action cannot be undone.`}
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border border-slate-200 hover:bg-slate-50"
                onClick={handleCancel}
                disabled={isDeleting}
              >Cancel</button>
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                aria-busy={isDeleting}
              >{isDeleting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
