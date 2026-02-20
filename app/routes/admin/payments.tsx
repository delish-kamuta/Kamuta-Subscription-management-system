import { SidebarTrigger } from "~/components/ui/sidebar";
import { Header } from "../../../components/Header";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import PaymentFilters from "~/components/payments/PaymentFilters";
import FinancialStatsSection from "~/components/payments/FinancialStatsSection";
import ChartsSection from "~/components/payments/ChartsSection";
import PaymentModals from "~/components/payments/PaymentModals";
import PaymentTable from "~/components/payments/PaymentTable";
import { usePaymentStats } from "~/hooks/usePaymentStats";
import { usePaymentOverview } from "~/hooks/usePaymentOverview";

const Payments = () => {
  const itemsPerPage = 8;
  const [timeFilter, setTimeFilter] = useState("Week");
  
  const {
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    branchFilter,
    setBranchFilter,
    cashierFilter,
    setCashierFilter,
    typeFilter,
    setTypeFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    viewDetailsOpen,
    setViewDetailsOpen,
    selectedItem,
    setSelectedItem,
    sourceData,
    tableData,
    totalPages,
    handleExport,
    handleViewDetails,
    branches,
    cashiers,
    revenueByBranch,
  } = usePaymentStats(itemsPerPage);

  const { data: overviewData, loading: overviewLoading } = usePaymentOverview({ 
    time_range: timeFilter.toLowerCase() === 'today' ? 'today' :
                timeFilter.toLowerCase() === 'week' ? 'week' :
                timeFilter.toLowerCase() === 'month' ? 'month' :
                timeFilter.toLowerCase() === 'year' ? 'year' : 'week'
  });

  const paymentMethods = overviewData ? [
    { method: "Cash", count: overviewData.by_payment_method.cash.count, percentage: overviewData.by_payment_method.cash.percentage },
    { method: "MoMo", count: overviewData.by_payment_method.momo.count, percentage: overviewData.by_payment_method.momo.percentage }
  ] : [];

  const dailyRevenue = overviewData?.daily_trends || [];

  return (
    <main className="dashboard wrapper">
      <Header
        title="All Payments"
        description="Track activity, trends, and popular destinations in real time"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      <div className="flex justify-end px-4 md:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[100px] justify-between border border-black/10">
              {overviewLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : timeFilter}
              <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-none">
            <DropdownMenuLabel>Time Range</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTimeFilter("Today")}>Today</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter("Week")}>Week</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter("Month")}>Month</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter("Year")}>Year</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Financial Summary */}
      <FinancialStatsSection summary={overviewData} />

      {/* Charts Section */}
      <ChartsSection
        dailyRevenue={dailyRevenue}
        paymentMethods={paymentMethods}
        totalRevenue={overviewData?.summary.total_revenue || 0}
        revenueByBranch={revenueByBranch}
      />


      {/* Payments Table */}
      <section className="mt-6 bg-white rounded-lg shadow-sm">
        <PaymentFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
          cashierFilter={cashierFilter}
          setCashierFilter={setCashierFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onExport={handleExport}
          branches={branches}
          cashiers={cashiers}
        />

        {loading && (
          <div className="px-4 md:px-6 py-4 text-sm text-gray-500">Loading payments…</div>
        )}
        {error && (
          <div className="px-4 md:px-6 py-4 text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && (
        <>
        <div className="px-4 md:px-6 py-2 text-sm text-gray-500 bg-gray-50/50 flex w-full justify-end gap-2">
           Found <span className="font-medium text-green-600">{sourceData.length}</span> payments
        </div>
        <PaymentTable
          filteredPayments={tableData}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onViewDetails={(payment) => {
            const original = sourceData.find((p) => p.paymentId === payment.regNumber);
            if (original) handleViewDetails(original);
          }}
        />
        </>
        )}

        {/* Pagination */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            ← Previous
          </button>
          <div className="flex gap-2 flex-wrap justify-center">
            {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-md ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </section>

      {/* Modals */}
      <PaymentModals
        viewDetailsOpen={viewDetailsOpen}
        setViewDetailsOpen={setViewDetailsOpen}
        selectedItem={selectedItem}
      />
    </main>
  );
};

export default Payments;
