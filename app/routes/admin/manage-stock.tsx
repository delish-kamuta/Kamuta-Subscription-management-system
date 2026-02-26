import { SidebarTrigger } from "~/components/ui/sidebar";
import { Header } from "../../../components/Header";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ArrowLeft, TrendingUp, AlertTriangle, Plus, Pencil } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "~/components/ui/badge";
import { useState, useEffect } from "react";
import { AddIngredientSheet } from "~/components/inventory/AddIngredientSheet";
import { listIngredients, Ingredient } from "~/services/inventory";

export default function ManageStockPage() {
  const navigate = useNavigate();
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIngredients = async () => {
      try {
          setLoading(true);
          const data = await listIngredients();
          // Adjust based on actual API response structure (e.g., data.data or directly data)
          if (Array.isArray(data)) {
              setIngredients(data);
          } else if (data.data && Array.isArray(data.data)) {
               setIngredients(data.data);
          }
      } catch (error) {
          console.error("Failed to fetch ingredients", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  // Mock data matching the screenshot
  const stats = {
      stockValue: "12,450 RWF",
      trend: "12% vs last month"
  };

  const lowStockAlerts = [
      { id: 1, item: "Rice", quantity: "8kg", threshold: "10kg" },
      { id: 2, item: "Cooking Oil", quantity: "2L", threshold: "10L" }
  ];

  const refillNeeded = [
      { id: 1, item: "Rice", quantity: "8kg", threshold: "10kg" },
      { id: 2, item: "Cooking Oil", quantity: "2L", threshold: "10L" }
  ];

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6">
       <div className="flex flex-col items-center gap-4">
          <Header
            title="Manage Stock"
            description="Track activity, trends, and popular destinations in real time"
            action={
              <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
            }
          />
           <div className="w-full p-0 flex justify-between items-center">
             <Button variant="ghost" size="icon" className="flex justify-start pl-0 hover:bg-transparent hover:text-blue-600" onClick={() => navigate(-1)}>
               <ArrowLeft className="h-5 w-5 mr-2" />
               Back
             </Button>

             <Button 
                onClick={() => setIsAddIngredientOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
             >
                <Plus className="h-4 w-4" />
                Add New Ingredient
             </Button>
           </div>
      </div>

      <AddIngredientSheet 
        open={isAddIngredientOpen} 
        onOpenChange={(open) => {
            setIsAddIngredientOpen(open);
            if (!open) setSelectedIngredient(null);
        }} 
        initialData={selectedIngredient}
        onSuccess={() => {
            fetchIngredients();
        }}
      />

        {/* Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Stock Value */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center gap-2">
                <span className="text-gray-600 font-medium">Current Stock Value</span>
                <span className="text-4xl font-bold text-gray-900">{stats.stockValue}</span>
                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                     <TrendingUp className="h-4 w-4" />
                     {stats.trend}
                </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative">
                <span className="text-gray-600 font-medium block mb-4">Low Stock Alerts</span>
                <div className="space-y-4">
                    {lowStockAlerts.map(alert => (
                        <div key={alert.id} className="flex items-center gap-2 text-gray-900 font-semibold">
                            <AlertTriangle className="h-5 w-5 text-orange-400 fill-orange-50 stroke-orange-500" />
                            <span>{alert.item}: {alert.quantity} <span className="text-gray-500 font-normal">(below {alert.threshold})</span></span>
                        </div>
                    ))}
                </div>
                <Badge className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600">2 +</Badge>
            </div>

             {/* Refill Needed Soon */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <span className="text-gray-600 font-medium block mb-4">Refill Needed Soon</span>
                <div className="space-y-3">
                    {refillNeeded.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="font-bold text-gray-900">{item.item}: {item.quantity}</span>
                                <span className="text-gray-500 text-sm">(below {item.threshold})</span>
                             </div>
                             <Button variant="secondary" className="bg-[#FEFCE8] text-[#854D0E] hover:bg-[#FEF08A] h-8 text-xs font-semibold">
                                 Refill Stock
                             </Button>
                        </div>
                    ))}
                </div>
             </div>
        </div>


      {/* Ingredients Table Section */}
      <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Ingredient Stock</h2>
          
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <Table>
            <TableHeader className="bg-slate-50/50">
                <TableRow>
                <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">INGREDIENTS</TableHead>
                <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">AVAILABLE</TableHead>
                <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">QUALITY PER MEAL</TableHead>
                <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">COST</TableHead>
                <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">STATUS</TableHead>
                <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-right">ACTIONS</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">Loading ingredients...</TableCell>
                    </TableRow>
                ) : ingredients.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">No ingredients found.</TableCell>
                    </TableRow>
                ) : (
                ingredients.map((row) => (
                <TableRow key={row.id}>
                    <TableCell className="font-bold text-gray-900">{row.name}</TableCell>
                    <TableCell className="text-gray-600">0 {row.unit}</TableCell> {/* TODO: Use actual quantity when available */}
                    <TableCell className="text-gray-600">N/A</TableCell> {/* TODO: Integrate quality per meal */}
                    <TableCell className="text-gray-600">N/A</TableCell> {/* TODO: Integrate cost */}
                    <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            (0 >= row.min_quantity) // Assuming current quantity is 0 for now
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700' 
                        }`}>
                            {(0 >= row.min_quantity) ? 'Low' : 'Enough'}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                                setSelectedIngredient(row);
                                setIsAddIngredientOpen(true);
                            }}
                        >
                            <Pencil className="h-4 w-4 text-gray-500" />
                        </Button>
                    </TableCell>
                </TableRow>
                ))
                )}
            </TableBody>
            </Table>
          </div>
      </div>
    </main>
  );
}
