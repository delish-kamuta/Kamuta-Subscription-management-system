import { Search, Calendar, Download } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface PaymentFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  branchFilter: string;
  setBranchFilter: (value: string) => void;
  cashierFilter: string;
  setCashierFilter: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  onExport: () => void;
}

export default function PaymentFilters({
  searchTerm,
  setSearchTerm,
  branchFilter,
  setBranchFilter,
  cashierFilter,
  setCashierFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onExport,
}: PaymentFiltersProps) {
  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="p-4 md:p-6 border-b border-gray-200">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-full md:flex-1 md:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 border-gray-300"
          />
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="All">Branch: All</option>
            <option value="KIGALI">KIGALI</option>
            <option value="HUYE">HUYE</option>
            <option value="MUSANZE">MUSANZE</option>
            <option value="RUBAVU">RUBAVU</option>
            <option value="NYARUGENGE">NYARUGENGE</option>
            <option value="GASABO">GASABO</option>
            <option value="KICUKIRO">KICUKIRO</option>
            <option value="RUSIZI">RUSIZI</option>
          </select>
          <select
            value={cashierFilter}
            onChange={(e) => setCashierFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="All">Cashier: All</option>
            <option value="James Anderson">James Anderson</option>
            <option value="Michael Johnson">Michael Johnson</option>
            <option value="David Brown">David Brown</option>
          </select>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm outline-none"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm outline-none"
              />
            </div>
            {(startDate || endDate) && (
              <Button variant="ghost" className="text-sm" onClick={clearDates}>
                Clear
              </Button>
            )}
          </div>
          <Button variant="outline" className="text-sm border-gray-300" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>
    </div>
  );
}
