import { Search, ChevronDown, Download } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface FiltersBarProps {
  // values
  searchTerm: string;
  subscriptionTypeFilter: string;
  customerTypeFilter: string;
  startDate: string;
  endDate: string;
  // setters
  setSearchTerm: (v: string) => void;
  setSubscriptionTypeFilter: (v: string) => void;
  setCustomerTypeFilter: (v: string) => void;
  setStartDate: (v: string) => void;
  setEndDate: (v: string) => void;
  clearDates: () => void;
  // role
  isAdminOrCashier: boolean;
  isCashier: boolean;
  // actions
  onExport: () => void;
}

export default function FiltersBar({
  searchTerm,
  subscriptionTypeFilter,
  customerTypeFilter,
  startDate,
  endDate,
  setSearchTerm,
  setSubscriptionTypeFilter,
  setCustomerTypeFilter,
  setStartDate,
  setEndDate,
  clearDates,
  isAdminOrCashier,
  isCashier,
  onExport,
}: FiltersBarProps) {
  return (
    <div className="flex flex-col p-4 border-b border-gray-200 gap-4">
      <div className="w-full md:flex-1 md:max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search by name or card ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 border-gray-300"
        />
      </div>
      <div className="">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
            <select
              className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white w-full md:w-auto"
              value={subscriptionTypeFilter}
              onChange={(e) => setSubscriptionTypeFilter(e.target.value)}
            >
              <option value="All">Subscription Type: All</option>
              <option value="VVIP">VVIP</option>
              <option value="Vip">VIP</option>
              <option value="Ordinary">Ordinary</option>
            </select>
            <div className="relative w-full md:w-auto">
              <select
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white w-full md:w-auto "
              >
                <option value="All">Customer Type: All</option>
                <option value="Student">Student</option>
                <option value="Campus Worker">Campus Worker</option>
                <option value="Regular">Regular</option>
              </select>
            </div>
            {!isCashier && (
              <Button variant="outline" className="text-sm border-gray-300">
                Branch <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            )}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1 w-full md:w-auto">
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
            {isAdminOrCashier ? (
              <Button className="text-sm text-white bg-primary-100">Generate QR Code</Button>
            ) : (
              <Button className="text-sm text-white bg-primary-100">Add Subscription</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
