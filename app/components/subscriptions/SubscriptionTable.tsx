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
import { useAppSelector } from "~/store/hooks";

interface SubscriptionTableProps {
  items: SubscriptionItem[];
  isCashier: boolean;
}

export function SubscriptionTable({ items, isCashier }: SubscriptionTableProps) {
  const { items: branches } = useAppSelector((s) => (s as any).branches || { items: [] });
  const resolveBranchName = (v: string | undefined) => {
    if (!v) return '';
    const match = Array.isArray(branches) ? (branches as any[]).find((b: any) => b.id === v || b.name === v) : null;
    return match?.name || v;
  };
  const columns = getSubscriptionColumns(isCashier, resolveBranchName);
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
