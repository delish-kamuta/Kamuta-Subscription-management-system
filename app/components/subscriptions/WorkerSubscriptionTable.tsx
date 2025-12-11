import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "~/lib/utils";
import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";

interface WorkerSubscriptionTableProps {
  items: SubscriptionItem[];
}

export default function WorkerSubscriptionTable({ items }: WorkerSubscriptionTableProps) {
  return (
    <div className="overflow-x-auto text-gray-500">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Phone</TableHead>
            <TableHead className="whitespace-nowrap">Name</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Branch</TableHead>
            <TableHead className="whitespace-nowrap">Prepaid Balance</TableHead>
            <TableHead className="whitespace-nowrap">Credit Balance</TableHead>
            <TableHead className="whitespace-nowrap">Meals (This Month)</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Last Meal</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Last Top-up</TableHead>
            <TableHead className="whitespace-nowrap">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const lastMeal = (item as any).lastMeal as string | undefined;
            const lastTopUp = (item as any).lastTopUp as string | undefined;
            const lastMealFmt = lastMeal
              ? new Date(lastMeal).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : "";
            const lastTopUpFmt = lastTopUp
              ? new Date(lastTopUp).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : "";
            const prepaid = Number((item as any).prepaidBalance ?? (item as any).walletBalance ?? 0);
            const credit = Number((item as any).creditBalance ?? 0);
            const mealsThisMonth = Number((item as any).mealsThisMonth ?? 0);

            return (
              <TableRow key={`${item.id}-${item.subscriptionType || ''}`}>
                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                <TableCell className="font-medium text-black">{item.clientName}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{item.branch}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(prepaid)}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(credit)}</TableCell>
                <TableCell className="font-semibold">{mealsThisMonth}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{lastMealFmt}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{lastTopUpFmt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white border border-black/10">
                      <DropdownMenuItem>Open Wallet</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}