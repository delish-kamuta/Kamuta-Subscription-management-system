import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import StatsCard from "../../../components/StatsCard";
import { subscriptionStats } from "app/constants";
import { Search, ChevronDown, Download } from "lucide-react"; // Importing icons
// Local component state no longer needed after hook integration
import { useAppSelector } from "~/store/hooks";
import { UserRole } from "~/types/auth";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { exportToCsv } from "~/lib/utils";
import { useSubscriptionFilters } from "~/hooks/useSubscriptionFilters";
import { useStudentSubscriptions } from "~/hooks/useStudentSubscriptions";
import { useWorkerSubscriptions } from "~/hooks/useWorkerSubscriptions";
import SubscriptionTable from "~/components/subscriptions/SubscriptionTable";
import WorkerSubscriptionTable from "~/components/subscriptions/WorkerSubscriptionTable";
import FiltersBar from "~/components/subscriptions/FiltersBar"; // Importing FiltersBar component
import RegisterSubscriptionSheet from "~/components/subscriptions/RegisterSubscriptionSheet";
import { useState } from "react";

const Subscription = () => {
  const [openRegister, setOpenRegister] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role;
  const isAdminOrCashier = role === UserRole.ADMIN || role === UserRole.CASHIER;
  const isCashier = role === UserRole.CASHIER;
  const { items: studentItems, loading: studentLoading, error: studentError } = useStudentSubscriptions();
  const { items: workerItems, loading: workerLoading, error: workerError } = useWorkerSubscriptions();
  const [activeTab, setActiveTab] = useState<'students' | 'workers'>("students");
  const activeItems = activeTab === 'students' ? studentItems : workerItems;
  const {
    state: { searchTerm, subscriptionTypeFilter, customerTypeFilter, startDate, endDate, currentPage },
    setters: { setSearchTerm, setSubscriptionTypeFilter, setCustomerTypeFilter, setStartDate, setEndDate, setCurrentPage, clearDates },
    filteredData,
    paginatedData,
    totalPages,
    exportRows,
  } = useSubscriptionFilters({ data: activeItems });

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
        {/* Tabs */}
        <div className="px-4 md:px-6 pt-4 flex gap-2">
          <Button
            variant={activeTab === 'students' ? 'outline' : 'default'}
            onClick={() => setActiveTab('students')}
          >
            Students
          </Button>
          <Button
            variant={activeTab === 'workers' ? 'outline' : 'default'}
            onClick={() => setActiveTab('workers')}
          >
            Workers
          </Button>
        </div>
        {/* Search and Filters */}
        <FiltersBar
          searchTerm={searchTerm}
          subscriptionTypeFilter={subscriptionTypeFilter}
          customerTypeFilter={customerTypeFilter}
          startDate={startDate}
          endDate={endDate}
          setSearchTerm={setSearchTerm}
          setSubscriptionTypeFilter={setSubscriptionTypeFilter}
          setCustomerTypeFilter={setCustomerTypeFilter}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          clearDates={clearDates}
          isAdminOrCashier={isAdminOrCashier}
          isCashier={isCashier}
          onExport={handleExport}
        />
        {/* Loading / Error / Table */}
        {(activeTab === 'students' ? studentLoading : workerLoading) && (
          <div className="px-4 md:px-6 py-4 text-sm text-gray-500">Loading subscriptions…</div>
        )}
        {(activeTab === 'students' ? studentError : workerError) && (
          <div className="px-4 md:px-6 py-4 text-sm text-red-600">{activeTab === 'students' ? studentError : workerError}</div>
        )}
        {!(activeTab === 'students' ? studentLoading : workerLoading) && !(activeTab === 'students' ? studentError : workerError) && (
          activeTab === 'students' ? (
            <SubscriptionTable items={paginatedData} isCashier={isCashier} />
          ) : (
            <WorkerSubscriptionTable items={paginatedData} />
          )
        )}

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
