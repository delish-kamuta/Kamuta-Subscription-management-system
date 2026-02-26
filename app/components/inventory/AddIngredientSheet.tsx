import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { useState, useEffect } from "react"
import { createIngredient, updateIngredient, type Ingredient } from "~/services/inventory"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess?: () => void
  initialData?: Ingredient | null
}

export function AddIngredientSheet({ open, onOpenChange, onSuccess, initialData }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    description: "",
    min_quantity: 0
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          unit: initialData.unit,
          description: initialData.description || "",
          min_quantity: initialData.min_quantity
        })
      } else {
        setFormData({ name: "", unit: "", description: "", min_quantity: 0 })
      }
      setError("")
      setSuccess("")
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      let res;
      if (initialData && initialData.id) {
         res = await updateIngredient(initialData.id, formData)
      } else {
         res = await createIngredient(formData)
      }

      if (res.success || res.status === 200 || res.status === 201) {
        setSuccess(initialData ? "Ingredient updated successfully!" : "Ingredient created successfully!")
        if (!initialData) {
            setFormData({ name: "", unit: "", description: "", min_quantity: 0 })
        }
        if (onSuccess) onSuccess()
        setTimeout(() => {
            onOpenChange(false)
            setSuccess("")
        }, 1500)
      } else {
        setError(res.message || (initialData ? "Failed to update ingredient" : "Failed to create ingredient"))
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>{initialData ? "Edit Ingredient" : "Add New Ingredient"}</SheetTitle>
          <SheetDescription>{initialData ? "Update existing inventory item." : "Create a new inventory item to track."}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name *</label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
              placeholder="e.g. Rice" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="unit" className="text-sm font-medium">Unit *</label>
            <Input 
              id="unit" 
              value={formData.unit} 
              onChange={(e) => setFormData({...formData, unit: e.target.value})} 
              required 
              placeholder="e.g. kg, L, pcs" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="min_quantity" className="text-sm font-medium">Minimum Quantity (Threshold) *</label>
            <Input 
              id="min_quantity" 
              type="number"
              value={formData.min_quantity} 
              onChange={(e) => setFormData({...formData, min_quantity: Number(e.target.value)})} 
              required 
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Input 
              id="description" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              placeholder="Brief description" 
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Ingredient" : "Create Ingredient")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
