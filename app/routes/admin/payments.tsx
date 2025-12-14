import { SidebarTrigger } from "~/components/ui/sidebar";
import { Header } from "../../../components/Header";
import { useState } from "react";
import { exportToCsv, formatCurrency } from "~/lib/utils";
import { toDateKey, isWithinRange } from "~/lib/date";
import PaymentFilters from "~/components/payments/PaymentFilters";
import FinancialStatsSection from "~/components/payments/FinancialStatsSection";
import ChartsSection from "~/components/payments/ChartsSection";
import PaymentModals from "~/components/payments/PaymentModals";
import PaymentTable from "~/components/payments/PaymentTable";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { fetchPaymentsThunk } from "~/store/paymentsSlice";
import { useEffect } from "react";

interface Payment {
  paymentId: string;
  clientName: string;
  branch: string;
  subscriptionType: string;
  amountPaid: number;
  totalMeals: number;
  paymentDate: string;
  addedNotes: string;
  payment: string;
}

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useAppDispatch();
  const paymentsState = useAppSelector((s) => (s as any).payments);
  const branchesState = useAppSelector((s) => (s as any).branches);
  const apiPayments = (paymentsState?.items ?? []) as any[];
  const loading = Boolean(paymentsState?.loading);
  const error = paymentsState?.error as string | null;

  useEffect(() => {
    if (!paymentsState?.loaded && !paymentsState?.loading) {
      dispatch(fetchPaymentsThunk());
    }
  }, [dispatch, paymentsState?.loaded, paymentsState?.loading]);
  const [currentPage, setCurrentPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState("All");
  const [cashierFilter, setCashierFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState<Payment | null>(null);
  const itemsPerPage = 8;

  // Prepare data for charts
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      display: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      key: date.toISOString().split('T')[0], // YYYY-MM-DD format for matching
    };
  }).reverse();

  // Normalize data source to a common shape for charts/table
  const sourceData = apiPayments.length
    ? apiPayments.map((r) => ({
        paymentId: r.regNumber,
        clientName: r.customerName,
        branch: r.branch,
        subscriptionType: "",
        amountPaid: Number(String(r.amount).replace(/[^0-9.]/g, "")) || 0,
        totalMeals: 0,
        paymentDate: r.date,
        paymentDateKey: r.date ? new Date(r.date).toISOString().split('T')[0] : '', // Normalize to YYYY-MM-DD
        addedNotes: "",
        payment: r.paymentMethod,
      }))
    : [];

  const dailyRevenue = last7Days.map((day) => ({
    date: day.display,
    amount: sourceData
      .filter((p) => p.paymentDateKey === day.key)
      .reduce((sum, p) => sum + p.amountPaid, 0),
  }));

  const totalRevenue = sourceData.reduce((sum, p) => sum + p.amountPaid, 0);

  const paymentMethodsData = sourceData.reduce((acc, payment) => {
    const method = payment.payment;
    if (!acc[method]) {
      acc[method] = { count: 0, amount: 0 };
    }
    acc[method].count++;
    acc[method].amount += payment.amountPaid;
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  const paymentMethods = Object.entries(paymentMethodsData).map(([method, data]) => ({
    method,
    count: data.count,
    percentage: (data.count / sourceData.length) * 100,
  }));

  const topPayments = [...sourceData]
    .sort((a, b) => b.amountPaid - a.amountPaid)
    .slice(0, 5)
    .map((p) => ({
      id: parseInt(String(p.paymentId).replace("PAY-", "")) || 0,
      customerName: p.clientName,
      regNumber: p.paymentId,
      amount: formatCurrency(p.amountPaid),
      paymentMethod: p.payment,
      date: p.paymentDate,
      status: "Completed",
      branch: p.branch,
      cashier: "N/A",
    }));

  // sourceData defined above

  const filteredData = sourceData.filter((item) => {
    const matchesSearch =
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.paymentId.includes(searchTerm);
    const matchesBranch = branchFilter === "All" || item.branch === branchFilter;
    const matchesCashier = cashierFilter === "All" || true; // Cashier data not in payment object yet
    const itemKey = toDateKey(item.paymentDate);
    const fromKey = toDateKey(startDate);
    const toKey = toDateKey(endDate);
    const withinRange = isWithinRange(itemKey, fromKey, toKey);
    return matchesSearch && matchesBranch && matchesCashier && withinRange;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleExport = () => {
    const headers = [
      "Payment ID",
      "Client Name",
      "Branch",
      "Subscription Type",
      "Amount Paid",
      "Total Meals",
      "Payment Date",
      "Notes",
      "Payment Method",
    ];
    const rows = filteredData.map((item) => [
      item.paymentId,
      item.clientName,
      item.branch,
      item.subscriptionType,
      item.amountPaid,
      item.totalMeals,
      item.paymentDate,
      item.addedNotes,
      item.payment,
    ]);
    exportToCsv(headers, rows, "payments");
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedItem(payment);
    setViewDetailsOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setEditForm(payment);
    setEditOpen(true);
  };

  const handleDelete = (payment: Payment) => {
    if (confirm(`Are you sure you want to delete payment for ${payment.clientName}?`)) {
      console.log("Deleting payment:", payment.paymentId);
      alert(`Payment for ${payment.clientName} has been deleted`);
      // TODO: Dispatch Redux action to delete payment
    }
  };

  // Convert filtered data to match PaymentTable component interface
  const tableData = filteredData.map((p) => ({
    id: parseInt(String(p.paymentId).replace("PAY-", "")) || 0,
    customerName: p.clientName,
    regNumber: p.paymentId,
    amount: formatCurrency(p.amountPaid),
    paymentMethod: p.payment,
    date: p.paymentDate,
    status: "Completed",
    branch: p.branch,
    cashier: "N/A",
  }));

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
          onEdit={(payment) => {
            const original = sourceData.find((p) => p.paymentId === payment.regNumber);
            if (original) handleEdit(original);
          }}
          onDelete={(payment) => {
            const original = sourceData.find((p) => p.paymentId === payment.regNumber);
            if (original) handleDelete(original);
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
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        selectedItem={selectedItem}
        editForm={editForm}
        setEditForm={setEditForm}
      />
    </main>
  );
};

export default Payments;
