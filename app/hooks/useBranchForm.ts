import { useState } from "react"
import { apiClient, ensureValidTokenOrMessage } from "~/lib/api"

export function useBranchForm(
  setSuccessMessage: (v: string) => void,
  setError: (v: string) => void,
  setIsLoading: (v: boolean) => void,
  setIsAddBranchOpen: (v: boolean) => void
) {
  const [branchForm, setBranchForm] = useState({
    name: "",
    campus: "University of Rwanda",
    student_regular_price: 0,
    student_vip_price: 0,
    student_vvip_price: 0,
    worker_regular_price: 2000,
    worker_vip_price: 2000,
    worker_vvip_price: 2000,
    irregular_regular_price: 1000,
    irregular_vip_price: 1500,
    irregular_vvip_price: 2000,
  })

  const handleAddBranch = async (e: React.FormEvent) => {
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

      await apiClient('/branches', {
        method: 'POST',
        body: JSON.stringify({
          name: branchForm.name,
          campus: branchForm.campus,
          student_regular_price: String(Number(branchForm.student_regular_price)),
          student_vip_price: String(Number(branchForm.student_vip_price)),
          student_vvip_price: String(Number(branchForm.student_vvip_price)),
          worker_regular_price: String(Number(branchForm.worker_regular_price)),
          worker_vip_price: String(Number(branchForm.worker_vip_price)),
          worker_vvip_price: String(Number(branchForm.worker_vvip_price)),
          irregular_regular_price: String(Number(branchForm.irregular_regular_price)),
          irregular_vip_price: String(Number(branchForm.irregular_vip_price)),
          irregular_vvip_price: String(Number(branchForm.irregular_vvip_price)),
        }),
      })

      setSuccessMessage('Branch added successfully!')

      setBranchForm({
        name: "",
        campus: "University of Rwanda",
        student_regular_price: 0,
        student_vip_price: 0,
        student_vvip_price: 0,
        worker_regular_price: 2000,
        worker_vip_price: 2000,
        worker_vvip_price: 2000,
        irregular_regular_price: 1000,
        irregular_vip_price: 1500,
        irregular_vvip_price: 2000,
      })

      setTimeout(() => {
        setIsAddBranchOpen(false)
        setSuccessMessage("")
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to add branch')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    branchForm,
    setBranchForm,
    handleAddBranch
  }
}
