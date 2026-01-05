import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
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
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

export function WalletTransactionsTable({ 
  transactions,
  startDate: propStartDate,
  endDate: propEndDate,
  onStartDateChange,
  onEndDateChange
}: WalletTransactionsTableProps) {
  // Internal state for fallback if props are not provided (though we intend to provide them)
  const [internalStartDate, setInternalStartDate] = useState("")
  const [internalEndDate, setInternalEndDate] = useState("")

  const startDate = propStartDate !== undefined ? propStartDate : internalStartDate
  const endDate = propEndDate !== undefined ? propEndDate : internalEndDate
  const setStartDate = onStartDateChange || setInternalStartDate
  const setEndDate = onEndDateChange || setInternalEndDate

  if (!transactions && (!propStartDate && !propEndDate)) { // Check if transactions are missing and we are not in controlled mode (roughly)
     // Actually the original check was:
     // if (!transactions || transactions.length === 0)
     // But now transactions might be empty BECAUSE of the filter.
     // So we should render the table structure even if empty, or at least the filter controls.
  }
  
  // If we are controlled (props provided), we assume 'transactions' is already filtered.
  // If we are uncontrolled (internal state), we filter here.
  const isControlled = propStartDate !== undefined && propEndDate !== undefined;

  const filteredTransactions = isControlled ? transactions : transactions?.filter((t) => {
    if (!startDate && !endDate) return true
    const dateStr = t.date || t.created_at
    if (!dateStr) return false
    const tDate = new Date(dateStr).getTime()
    const start = startDate ? new Date(startDate).getTime() : 0
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity
    return tDate >= start && tDate <= end
  }) || []

  if ((!transactions || transactions.length === 0) && !startDate && !endDate) {
      return <p className="text-sm text-gray-500 mt-4">No transactions found.</p>
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto"
          />
          <span className="text-gray-500">-</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-auto"
          />
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate("")
                setEndDate("")
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
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
          {filteredTransactions
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