import { SidebarTrigger } from "~/components/ui/sidebar";
import { Header } from "../../../components/Header";
import PaymentFilters from "~/components/payments/PaymentFilters";
import FinancialStatsSection from "~/components/payments/FinancialStatsSection";
import ChartsSection from "~/components/payments/ChartsSection";
import PaymentModals from "~/components/payments/PaymentModals";
import PaymentTable from "~/components/payments/PaymentTable";
import { usePaymentStats } from "~/hooks/usePaymentStats";

const Payments = () => {
  const itemsPerPage = 8;
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
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    viewDetailsOpen,
    setViewDetailsOpen,
    selectedItem,
    setSelectedItem,
    sourceData,
    dailyRevenue,
    totalRevenue,
    paymentMethods,
    tableData,
    totalPages,
    handleExport,
    handleViewDetails,
  } = usePaymentStats(itemsPerPage);

  return (
    <main className="dashboard wrapper">
      <Header
        title="All Payments"
        description="Track activity, trends, and popular destinations in real time"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      {/* Financial Summary */}
      <FinancialStatsSection paymentsData={sourceData} />

      {/* Charts Section */}
      <ChartsSection
        dailyRevenue={dailyRevenue}
        paymentMethods={paymentMethods}
        totalRevenue={totalRevenue}
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
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onExport={handleExport}
        />

        {loading && (
          <div className="px-4 md:px-6 py-4 text-sm text-gray-500">Loading payments…</div>
        )}
        {error && (
          <div className="px-4 md:px-6 py-4 text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && (
        <PaymentTable
          filteredPayments={tableData}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onViewDetails={(payment) => {
            const original = sourceData.find((p) => p.paymentId === payment.regNumber);
            if (original) handleViewDetails(original);
          }}
        />
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
