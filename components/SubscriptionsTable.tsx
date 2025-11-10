import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Eye, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Cancelled: "bg-red-50 text-red-500",
    Pending: "bg-sky-100 text-sky-600",
    Completed: "bg-emerald-100 text-emerald-700",
    Active: "bg-emerald-100 text-emerald-700",
    Expired: "bg-red-100 text-red-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${map[status] || "bg-gray-100 text-gray-700"}`}
    >
      {status}
    </span>
  );
};

// Mock sample data
const subscriptionData = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  date: "12 Sept, 2025",
  time: "09:15 AM",
  client: "John Doe",
  branch: "Nyamirambo",
  subscriptionType: "20 Meals",
  paymentMethod: ["Cash", "Mobile Money", "Card"][Math.floor(Math.random() * 3)],
  purchased: 20,
  used: Math.floor(Math.random() * 20),
  left: Math.floor(Math.random() * 20),
  lastMeal: "12 Sept, 2025 - 12:45 PM",
  status: ["Active", "Expired", "Pending"][Math.floor(Math.random() * 3)],
}));

// Main component
const SubscriptionsTable = ({ showCompact }: { showCompact?: boolean }) => {
  const [selectedRows, setSelectedRows] = useState<Array<number> | "all" | null>(null);

  useEffect(() => {
    // Logic for bulk selection or UI effects can go here
  }, [selectedRows]);

  return (
    <div className="bg-white rounded-lg shadow-sm  overflow-auto">
      <div className="p-4">
        <Table className="min-w-[60rem]">
          <TableHeader>
            <TableRow className="bg-gray-50">
              {!showCompact && (
                <TableHead className="w-12">
                  <Checkbox
                    className="cursor-pointer"
                    onCheckedChange={(checked) =>
                      checked ? setSelectedRows("all") : setSelectedRows(null)
                    }
                  />
                </TableHead>
              )}
              <TableHead>Id</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Purchased</TableHead>
              <TableHead>Left</TableHead>
              <TableHead>Payments</TableHead>
              <TableHead>Last Meal</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>

              {!showCompact && <TableHead className="text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {subscriptionData.map((row, index) => {
              return (
                <TableRow
                  key={row.id}
                  className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                >
                  {!showCompact && (
                    <TableCell className="align-top">
                      <Checkbox
                        className="cursor-pointer"
                        checked={
                          (Array.isArray(selectedRows) && selectedRows.includes(index)) ||
                          selectedRows === "all"
                        }
                        onCheckedChange={(checked) =>
                          checked
                            ? setSelectedRows((prev) => {
                                if (Array.isArray(prev)) return [...prev, index];
                                return [index];
                              })
                            : setSelectedRows((prev) => {
                                if (Array.isArray(prev)) {
                                  return prev.filter((i) => i !== index);
                                }
                                return prev;
                              })
                        }
                      />
                    </TableCell>
                  )}

                  <TableCell>
                   <div className="font-medium">{row.id}</div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{row.client}</div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{row.subscriptionType}</div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{row.purchased}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">{row.left}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{row.paymentMethod}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{row.lastMeal}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{row.branch}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>

                  {!showCompact && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md">
                          <Eye className="size-4" />
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md">
                          <Calendar className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubscriptionsTable;
