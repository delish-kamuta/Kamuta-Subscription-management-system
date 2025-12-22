import { useState } from "react"
import { apiClient, ensureValidTokenOrMessage } from "~/lib/api"
import { useAppDispatch } from "~/store/hooks"
import { addUserOptimistic } from "~/store/usersSlice"
import type { User, BranchOption } from "~/types/users"

export function useUserForm(
  branches: BranchOption[],
  setSuccessMessage: (v: string) => void,
  setError: (v: string) => void,
  setIsLoading: (v: boolean) => void,
  setIsAddUserOpen: (v: boolean) => void
) {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    role: "student",
    branch_id: "",
    password: "",
    reg_number: "",
  })

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) {
        setError(tokenError)
        setIsLoading(false)
        return
      }

      const isStudent = formData.role.toLowerCase() === 'student'
      const payload: any = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        password: formData.password,
        reg_number : formData.reg_number,
      }

      if (!formData.branch_id) {
        setError('Please select a branch.')
        setIsLoading(false)
        return
      }
      
      const selected = branches.find(b => String(b.id) === String(formData.branch_id))
      if (!selected) {
        setError('Selected branch is invalid. Please load branches or create one first.')
        setIsLoading(false)
        return
      }
      
      const maybeNum = Number(formData.branch_id)
      payload.branch_id = Number.isNaN(maybeNum) ? formData.branch_id : maybeNum

      if (isStudent && formData.reg_number) {
        payload.reg_number = formData.reg_number.trim()
      }

      if (typeof payload.reg_number === 'string' && payload.reg_number.trim() === '') {
        delete payload.reg_number
      }

      const result = await apiClient<any>('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setSuccessMessage('User added successfully!')
      const created = (result && (result.data || result.user || result)) as Partial<User>
      if (created) {
        dispatch(addUserOptimistic({
          id: String(created.id ?? crypto.randomUUID?.() ?? Date.now()),
          full_name: String(created.full_name ?? formData.full_name),
          phone: String(created.phone ?? formData.phone),
          role: String(created.role ?? formData.role),
          branch_id: String(created.branch_id ?? formData.branch_id),
          created_at: String(created.created_at ?? new Date().toISOString()),
          student: created.student ?? (formData.role.toLowerCase() === 'student' ? { reg_number: formData.reg_number } : undefined),
        }))
      }
      
      setFormData({
        full_name: "",
        phone: "",
        role: "student",
        branch_id: "",
        password: "",
        reg_number: "",
      })
      
      setTimeout(() => {
        setIsAddUserOpen(false)
        setSuccessMessage("")
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to add user')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    formData,
    setFormData,
    handleAddUser
  }
}
