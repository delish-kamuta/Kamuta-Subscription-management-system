import { useState } from "react"
import { apiClient, ensureValidTokenOrMessage } from "~/lib/api"
import { useAppDispatch } from "~/store/hooks"
import { updateUserOptimistic, removeUserOptimistic } from "~/store/usersSlice"
import type { User } from "~/types/users"

export function useUserActions(
  selectedUser: User | null,
  setSuccessMessage: (v: string) => void,
  setError: (v: string) => void,
  setIsLoading: (v: boolean) => void,
  setIsEditUserOpen: (v: boolean) => void
) {
  const dispatch = useAppDispatch()
  const [showNewPwdModal, setShowNewPwdModal] = useState(false)
  const [newPwdValue, setNewPwdValue] = useState<string>("")

  const handleAdminResetPassword = async (user: User) => {
    try {
      setError("")
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) { setError(tokenError); return }
      const data = await apiClient<any>('/users/admin-reset-password', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id }),
      })
      const newPwd = data?.data?.new_password
      setSuccessMessage(data?.message || 'Admin password reset successful')
      if (newPwd) {
        setNewPwdValue(String(newPwd))
        setShowNewPwdModal(true)
      }
      setTimeout(() => setSuccessMessage(''), 2500)
    } catch (e: any) {
      setError(e.message || 'Admin reset failed')
    }
  }

  const handleDeleteUser = async (user: User) => {
    try {
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) { setError(tokenError); return }

      await apiClient(`/users/${user.id}`, { method: 'DELETE' })
      setSuccessMessage('User deleted')
      dispatch(removeUserOptimistic(user.id))
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (e: any) {
      setError(e.message || 'Delete failed')
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      setIsLoading(true)
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) { setError(tokenError); setIsLoading(false); return }
      const body: any = {
        full_name: selectedUser.full_name,
        phone: selectedUser.phone,
        role: selectedUser.role,
        branch_id: selectedUser.branch_id,
      }
      if (selectedUser.password) {
        body.password = selectedUser.password
      }
      if (selectedUser.role.toLowerCase() === 'scanner' || selectedUser.role.toLowerCase() === 'cashier') {
        body.allowed_meal_types = selectedUser.allowed_meal_types ?? []
      }
      // if (selectedUser.role.toLowerCase() === 'student' && selectedUser.student?.reg_number) {
      //   body.reg_number = selectedUser.student.reg_number
      // }
      
      await apiClient(`/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      
      setSuccessMessage('User updated')
      dispatch(updateUserOptimistic({ id: selectedUser.id, ...body, student: selectedUser.student, allowed_meal_types: selectedUser.allowed_meal_types }))
      setIsEditUserOpen(false)
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (err: any) {
      setError(err.message || 'Update failed')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    showNewPwdModal,
    setShowNewPwdModal,
    newPwdValue,
    handleAdminResetPassword,
    handleDeleteUser,
    handleUpdateUser
  }
}
