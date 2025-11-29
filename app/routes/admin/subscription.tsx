import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import StatsCard from "../../../components/StatsCard";
import { subscriptionStats, subscriptionData } from "app/constants";
import { Search, ChevronDown, Calendar, MoreHorizontal, Download } from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "~\/store\/hooks";
import { UserRole } from "~\/types\/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

const Subscription = () => {
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role;
  const isAdminOrCashier = role === UserRole.ADMIN || role === UserRole.CASHIER;
  const isCashier = role === UserRole.CASHIER;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("All");
  const [subscriptionTypeFilter , setSubscriptionTypeFilter] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const itemsPerPage = 8;

  const MONTHS: Record<string, number> = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };

  // Convert a date string to a comparable yyyymmdd number.
  // Supports formats: "YYYY-MM-DD" and "Mon D, YYYY" (e.g., "Jan 6, 2022").
  const toDateKey = (value: string | undefined | null): number | null => {
    if (!value) return null;
    const v = value.trim();
    // ISO-like format from <input type="date">
    if (v.includes("-")) {
      const parts = v.split("-");
      if (parts.length !== 3) return null;
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      const d = Number(parts[2]);
      if (!y || !m || !d) return null;
      return y * 10000 + m * 100 + d;
    }
    // "Mon D, YYYY"
    const cleaned = v.replace(",", "");
    const segs = cleaned.split(/\s+/);
    if (segs.length !== 3) return null;
    const mon = MONTHS[segs[0] as keyof typeof MONTHS];
    const d = Number(segs[1]);
    const y = Number(segs[2]);
    if (!mon || !d || !y) return null;
    return y * 10000 + mon * 100 + d;
  };

  const filteredData = subscriptionData.filter((item) => {
    const matchesSearch =
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.includes(searchTerm);
    const matchesCustomerType =
      customerTypeFilter === "All" || item.customerType === customerTypeFilter;
    const matchesSubscriptionType = subscriptionTypeFilter === 'All' || item.subscriptionType === subscriptionTypeFilter;
    const itemKey = toDateKey(item.dateStarted);
    const fromKey = toDateKey(startDate);
    const toKey = toDateKey(endDate);
    const withinRange = (() => {
      if (!itemKey) return true;
      if (fromKey && itemKey < fromKey) return false;
      if (toKey && itemKey > toKey) return false;
      return true;
    })();
    return matchesSearch && matchesCustomerType && matchesSubscriptionType && withinRange;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <main className="dashboard wrapper">
      <Header
        title="Subscription"
        description="Track activity, trends, and popular destinations in real time"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      {/* Stats Cards Section */}
      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {subscriptionStats.map((stat) => (
            <StatsCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              currentDay={stat.currentDay}
              lastDayCount={stat.lastDayCount}
            />
          ))}
        </div>
      </section>

      {/* Subscription Table Section */}
      <section className="mt-6 bg-white rounded-lg shadow-sm ">
        {/* Search and Filters */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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
            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
              <select name="" className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white" value={subscriptionTypeFilter} onChange={(e)=>setSubscriptionTypeFilter(e.target.value)}>
                <option value="All">Subscription Type: All</option>
                <option value="VVIP">VVIP</option>
                <option value="Vip">VIP</option>
                <option value="Ordinary">Ordinary</option>

              </select>
              <div className="relative">
                <select
                  value={customerTypeFilter}
                  onChange={(e) => setCustomerTypeFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="All">Customer Type: All</option>
                  <option value="Student">Student</option>
                  <option value="Campus Worker">Campus Worker</option>
                  <option value="Regular">Regular</option>
                </select>
              </div>
              {!isCashier &&(
                <Button variant="outline" className="text-sm border-gray-300">
                Branch <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              )}
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
                  <Button
                    variant="ghost"
                    className="text-sm"
                    onClick={() => { setStartDate(""); setEndDate(""); }}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Button variant="outline" className="text-sm border-gray-300">
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

        {/* Table */}
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
              {paginatedData.map((item, index) => (
                <TableRow key={index}>
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

        {/* Pagination */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            ← Previous
          </Button>
          <div className="flex gap-2 flex-wrap justify-center">
            {Array.from(
              { length: Math.min(6, totalPages) },
              (_, i) => i + 1
            ).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                variant={currentPage === page ? "default" : "outline"}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next →
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Subscription;
