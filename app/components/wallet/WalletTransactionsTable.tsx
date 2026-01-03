import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

interface WalletTransactionsTableProps {
  transactions: any[];
}

export function WalletTransactionsTable({ transactions }: WalletTransactionsTableProps) {
  if (!transactions || transactions.length === 0) {
    return <p className="text-sm text-gray-500 mt-4">No transactions found.</p>
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="hidden md:table-cell">Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions
            .slice()
            .sort((a: any, b: any) => {
              const dateA = new Date(a.date || a.created_at).getTime();
              const dateB = new Date(b.date || b.created_at).getTime();
              return dateB - dateA;
            })
            .slice(0, 20)
            .map((t: any, idx: number) => {
              const combinedStr = (
                (t.type || '') + ' ' + 
                (t.payment_method || '') + ' ' + 
                (t.method || '') + ' ' + 
                (t.category || '') + ' ' +
                (t.description || '') + ' ' +
                (t.note || '')
              ).toLowerCase();

              const isTopUp = combinedStr.includes('payment') ||
                              combinedStr.includes('credit') ||
                              combinedStr.includes('deposit') ||
                              combinedStr.includes('top') ||
                              combinedStr.includes('cash') ||
                              combinedStr.includes('momo') ||
                              combinedStr.includes('card') ||
                              combinedStr.includes('mobile') ||
                              combinedStr.includes('transfer') ||
                              combinedStr.includes('fund') ||
                              combinedStr.includes('admin');
              
              const dateStr = t.date || t.created_at;
              const formattedDate = dateStr ? new Date(dateStr).toLocaleString() : '-';

              return (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-xs">{formattedDate}</TableCell>
                  <TableCell>{t.type || '-'}</TableCell>
                  <TableCell>
                    {isTopUp ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Top Up
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Charge
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{t.amount ?? t.value ?? '-'}</TableCell>
                  <TableCell className="hidden md:table-cell">{t.reference || t.id || '-'}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  )
}