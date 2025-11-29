import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";

interface SubscriptionTableProps {
  items: SubscriptionItem[];
  isCashier: boolean;
}

export function SubscriptionTable({ items, isCashier }: SubscriptionTableProps) {
  return (
    <div className="overflow-x-auto text-gray-500">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Reg Number</TableHead>
            <TableHead className="whitespace-nowrap">Client ID</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">Subscription Type</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Customer Type</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Date Started</TableHead>
            {!isCashier && (
              <TableHead className="whitespace-nowrap hidden xl:table-cell">Branch</TableHead>
            )}
            <TableHead className="whitespace-nowrap">Total Meals</TableHead>
            <TableHead className="whitespace-nowrap">Meals Left</TableHead>
            <TableHead className="whitespace-nowrap">Payment</TableHead>
            {!isCashier && (
              <TableHead className="whitespace-nowrap">Action</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs">{item.id}</TableCell>
              <TableCell className="font-medium text-black">{item.clientName}</TableCell>
              <TableCell className="hidden lg:table-cell">{item.subscriptionType}</TableCell>
              <TableCell className="hidden md:table-cell">{item.customerType}</TableCell>
              <TableCell className="hidden md:table-cell text-sm">{item.dateStarted}</TableCell>
              {!isCashier && (
                <TableCell className="hidden xl:table-cell text-sm">{item.branch}</TableCell>
              )}
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
                  {item.payment}
                </span>
              </TableCell>
              {!isCashier && (
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default SubscriptionTable;
