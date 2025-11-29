import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";
import { getSubscriptionColumns } from "~/components/subscriptions/columns";

interface SubscriptionTableProps {
  items: SubscriptionItem[];
  isCashier: boolean;
}

export function SubscriptionTable({ items, isCashier }: SubscriptionTableProps) {
  const columns = getSubscriptionColumns(isCashier);
  return (
    <div className="overflow-x-auto text-gray-500">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead
                key={col.key}
                className={col.headerClassName || "whitespace-nowrap"}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              {columns.map(col => (
                <TableCell key={String(col.key)} className={col.cellClassName}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default SubscriptionTable;
