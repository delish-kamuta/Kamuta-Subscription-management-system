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
}

export function UsersTable({ users, isLoading = false, onView, onEdit, onDelete }: Props) {
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
                      onClick={()=> {onEdit?.(user)}}
                      aria-label={`Edit ${user.full_name}`}
                    >Edit</button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => onDelete?.(user)}
                      aria-label={`Delete ${user.full_name}`}
                    >Delete</button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
