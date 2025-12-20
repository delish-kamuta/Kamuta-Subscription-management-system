import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, Eye } from "lucide-react";
import { useSelector } from "react-redux";

interface Payment {
  id: number;
  customerName: string;
  regNumber: string;
  amount: string;
  paymentMethod: string;
  date: string;
  branch: string;
  cashier: string;
}

interface PaymentTableProps {
  filteredPayments: Payment[];
  currentPage: number;
  itemsPerPage: number;
  onViewDetails: (payment: Payment) => void;
}

export default function PaymentTable({
  filteredPayments,
  currentPage,
  itemsPerPage,
  onViewDetails,
}: PaymentTableProps) {
  const branches = useSelector((state: any) => state?.branches?.items || state?.branches?.branches || []);
  const branchById: Record<string, string> = Array.isArray(branches)
    ? branches.reduce((acc: Record<string, string>, b: any) => {
        const id = String(b?.id ?? b?.branch_id ?? "");
        const name = String(b?.name ?? b?.branch_name ?? "");
        if (id) acc[id] = name || id;
        return acc;
      }, {})
    : {};
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Customer Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentItems.map((payment, idx) => (
          <TableRow key={`${payment.id}-${idx}`}>
            <TableCell className="font-medium">#{payment.id}</TableCell>
            <TableCell>{payment.customerName}</TableCell>
            <TableCell className="font-semibold text-green-600">{payment.amount}</TableCell>
            <TableCell>{payment.paymentMethod}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(payment.date).toLocaleDateString()}
            </TableCell>
            <TableCell>{branchById[String(payment.branch)] || payment.branch}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-black/10">
                  <DropdownMenuItem onClick={() => onViewDetails(payment)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
