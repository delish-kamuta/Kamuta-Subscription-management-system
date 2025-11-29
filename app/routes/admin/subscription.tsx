import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import StatsCard from "../../../components/StatsCard";
import { subscriptionStats, subscriptionData } from "app/constants";
import { Search, ChevronDown, Download } from "lucide-react";
// Local component state no longer needed after hook integration
import { useAppSelector } from "~\/store\/hooks";
import { UserRole } from "~\/types\/auth";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { exportToCsv } from "~\/lib\/utils";
import { useSubscriptionFilters } from "~\/hooks\/useSubscriptionFilters";
import SubscriptionTable from "~\/components\/subscriptions\/SubscriptionTable";

const Subscription = () => {
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role;
  const isAdminOrCashier = role === UserRole.ADMIN || role === UserRole.CASHIER;
  const isCashier = role === UserRole.CASHIER;
  const {
    state: { searchTerm, subscriptionTypeFilter, customerTypeFilter, startDate, endDate, currentPage },
    setters: { setSearchTerm, setSubscriptionTypeFilter, setCustomerTypeFilter, setStartDate, setEndDate, setCurrentPage, clearDates },
    filteredData,
    paginatedData,
    totalPages,
    exportRows,
  } = useSubscriptionFilters({ data: subscriptionData });

  const handleExport = () => {
    const headers = [
      "Reg Number",
      "Client ID",
      "Subscription Type",
      "Customer Type",
      "Date Started",
      ...(isCashier ? [] : ["Branch"]),
      "Total Meals",
      "Meals Left",
      "Payment",
    ];
    const rows = exportRows(!isCashier);
    exportToCsv(headers, rows, "subscriptions");
  };

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
      {!isCashier&&(
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
      )}

      {/* Subscription Table Section */}
      <section className="bg-white rounded-lg shadow-sm ">
        {/* Search and Filters */}
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
              <select name="" className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white w-full md:w-auto" value={subscriptionTypeFilter} onChange={(e)=>setSubscriptionTypeFilter(e.target.value)}>
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
              {!isCashier &&(
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
                  <Button
                    variant="ghost"
                    className="text-sm"
                    onClick={clearDates}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Button variant="outline" className="text-sm border-gray-300" onClick={handleExport}>
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
        {/* Table */}
        <SubscriptionTable items={paginatedData} isCashier={isCashier} />

        {/* Pagination */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
