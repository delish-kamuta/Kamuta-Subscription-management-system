import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useState, useEffect } from "react"
// AddStockSheet imports select component
import { addStock, listIngredients, type Ingredient } from "~/services/inventory"
import { getAllBranches, type Branch } from "~/services/branches"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess?: () => void
}

export function AddStockSheet({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [branches, setBranches] = useState<Branch[]>([]) // Assuming you have a branch service/type
  
  const [formData, setFormData] = useState({
    ingredient_id: "",
    quantity: 0,
    unit_cost: 0,
    branch_id: ""
  })

  // Fetch ingredients and branches when sheet opens
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        try {
            const [ingRes, branchRes] = await Promise.all([
                listIngredients(),
                getAllBranches()
            ])
            
            if (Array.isArray(ingRes)) setIngredients(ingRes)
            else if (ingRes.data) setIngredients(ingRes.data)

            if (branchRes.branches) setBranches(branchRes.branches) 
            
        } catch (e) {
            console.error("Failed to load dependency data", e)
        }
      }
      loadData()
      setFormData({ ingredient_id: "", quantity: 0, unit_cost: 0, branch_id: "" })
      setError("")
      setSuccess("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const payload = {
        branch_id: formData.branch_id,
        items: [
            {
                ingredient_id: formData.ingredient_id,
                quantity: formData.quantity,
                unit_cost: formData.unit_cost
            }
        ]
    }

    try {
      const res = await addStock(payload)
      if (res.success || res.status === 201) {
        setSuccess("Stock added successfully!")
        setFormData({ ingredient_id: "", quantity: 0, unit_cost: 0, branch_id: "" })
        if (onSuccess) onSuccess()
        setTimeout(() => {
            onOpenChange(false)
            setSuccess("")
        }, 1500)
      } else {
        setError(res.message || "Failed to add stock")
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
          <SheetTitle>Add Stock (Stock In)</SheetTitle>
          <SheetDescription>Record new stock arrival for an ingredient.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="space-y-2">
            <label htmlFor="branch" className="text-sm font-medium">Branch *</label>
            <Select 
                value={formData.branch_id} 
                onValueChange={(val) => setFormData({...formData, branch_id: val})}
                required
            >
                <SelectTrigger id="branch">
                    <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                    {branches.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="ingredient" className="text-sm font-medium">Ingredient *</label>
            <Select 
                value={formData.ingredient_id} 
                onValueChange={(val) => setFormData({...formData, ingredient_id: val})}
                required
            >
                <SelectTrigger id="ingredient">
                    <SelectValue placeholder="Select Ingredient" />
                </SelectTrigger>
                <SelectContent>
                    {ingredients.map(ing => (
                        <SelectItem key={ing.id} value={ing.id!}>{ing.name} ({ing.unit})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="quantity" className="text-sm font-medium">Quantity *</label>
            <Input 
              id="quantity" 
              type="number"
              value={formData.quantity} 
              onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} 
              required 
              min="1"
              placeholder="Amount added"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="unit_cost" className="text-sm font-medium">Unit Cost (RWF) *</label>
            <Input 
              id="unit_cost" 
              type="number"
              value={formData.unit_cost} 
              onChange={(e) => setFormData({...formData, unit_cost: Number(e.target.value)})} 
              required 
              min="0"
              placeholder="Cost per unit"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? "Adding..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
