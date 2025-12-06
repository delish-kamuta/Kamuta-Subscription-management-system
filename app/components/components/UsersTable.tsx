import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"

export interface UserRow {
  id: string
  full_name: string
  phone: string
  role: string
  created_at: string
  reg_number?: string
}

type Props = {
  users: UserRow[]
}

export function UsersTable({ users }: Props) {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No users found. Note: User list API currently returns 401 Unauthorized.
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
                <TableCell>{user.reg_number || '-'}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
