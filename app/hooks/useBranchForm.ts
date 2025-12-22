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
    regular_price: 800,
    vip_price: 1200,
    vvip_price: 1800,
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
          regular_price: String(Number(branchForm.regular_price)),
          vip_price: String(Number(branchForm.vip_price)),
          vvip_price: String(Number(branchForm.vvip_price)),
        }),
      })

      setSuccessMessage('Branch added successfully!')

      setBranchForm({
        name: "",
        campus: "University of Rwanda",
        regular_price: 800,
        vip_price: 1200,
        vvip_price: 1800,
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
