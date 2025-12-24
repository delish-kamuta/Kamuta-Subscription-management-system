import type { Student } from "./auth"

export interface User {
  id: string
  full_name: string
  phone: string
  role: string
  branch_id: string
  created_at: string
  student?: Student
  // Optional field used only when admins update a user's password
  password?: string
}

export interface BranchOption {
  id: string
  name: string
}
