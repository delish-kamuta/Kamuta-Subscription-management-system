import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";

interface WorkerSubscriptionTableProps {
  items: SubscriptionItem[];
}

export function WorkerSubscriptionTable({ items }: WorkerSubscriptionTableProps) {
  return (
    <div className="overflow-x-auto text-gray-500">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Phone</TableHead>
            <TableHead className="whitespace-nowrap">Worker Name</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Meal Type</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Date Started</TableHead>
            <TableHead className="hidden xl:table-cell whitespace-nowrap">Branch</TableHead>
            <TableHead className="whitespace-nowrap">Total Meals</TableHead>
            <TableHead className="whitespace-nowrap">Meals Left</TableHead>
            <TableHead className="whitespace-nowrap">Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const d = item.dateStarted ? new Date(item.dateStarted) : null;
            const formattedDate = d
              ? d.toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : item.dateStarted;
            return (
              <TableRow key={`${item.id}-${item.subscriptionType || ''}`}>
                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                <TableCell className="font-medium text-black">{item.clientName}</TableCell>
                <TableCell className="hidden md:table-cell">{item.subscriptionType}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{formattedDate}</TableCell>
                <TableCell className="hidden xl:table-cell text-sm">{item.branch}</TableCell>
                <TableCell className="font-semibold">{item.totalMeals}</TableCell>
                <TableCell className="font-semibold">{item.mealsLeft}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      item.payment === "Cash"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.payment || "Wallet"}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default WorkerSubscriptionTable;