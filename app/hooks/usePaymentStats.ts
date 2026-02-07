import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { fetchPaymentsThunk } from "~/store/paymentsSlice";
import { fetchBranchesThunk } from "~/store/branchesSlice";
import { exportToCsv, formatCurrency } from "~/lib/utils";
import { toDateKey, isWithinRange } from "~/lib/date";

export interface Payment {
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

export const usePaymentStats = (itemsPerPage: number = 8) => {
  const dispatch = useAppDispatch();
  const paymentsState = useAppSelector((s) => (s as any).payments);
  const branchesState = useAppSelector((s) => (s as any).branches);
  const apiPayments = (paymentsState?.items ?? []) as any[];
  const loading = Boolean(paymentsState?.loading);
  const error = paymentsState?.error as string | null;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState("All");
  const [cashierFilter, setCashierFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Payment | null>(null);

  useEffect(() => {
    if (!paymentsState?.loaded && !paymentsState?.loading) {
      dispatch(fetchPaymentsThunk());
    }
    if (!branchesState?.loaded && !branchesState?.loading) {
      dispatch(fetchBranchesThunk());
    }
  }, [dispatch, paymentsState?.loaded, paymentsState?.loading, branchesState?.loaded, branchesState?.loading]);

  // Prepare data for charts
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
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
  }, []);

  // Normalize data source to a common shape for charts/table
  const sourceData = useMemo(() => {
    return apiPayments.length
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
  }, [apiPayments]);

  const dailyRevenue = useMemo(() => {
    return last7Days.map((day) => ({
      date: day.display,
      amount: sourceData
        .filter((p) => p.paymentDateKey === day.key)
        .reduce((sum, p) => sum + p.amountPaid, 0),
    }));
  }, [last7Days, sourceData]);

  const totalRevenue = useMemo(() => {
    return sourceData.reduce((sum, p) => sum + p.amountPaid, 0);
  }, [sourceData]);

  const paymentMethods = useMemo(() => {
    const paymentMethodsData = sourceData.reduce((acc, payment) => {
      const method = payment.payment;
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count++;
      acc[method].amount += payment.amountPaid;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return Object.entries(paymentMethodsData).map(([method, data]) => ({
      method,
      count: data.count,
      percentage: (data.count / sourceData.length) * 100,
    }));
  }, [sourceData]);

  const filteredData = useMemo(() => {
    return sourceData.filter((item) => {
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
    }).sort((a, b) => {
      const dateA = new Date(a.paymentDate).getTime();
      const dateB = new Date(b.paymentDate).getTime();
      return dateB - dateA;
    });
  }, [sourceData, searchTerm, branchFilter, cashierFilter, startDate, endDate]);

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

  // Convert filtered data to match PaymentTable component interface
  const tableData = useMemo(() => {
    return filteredData.map((p) => ({
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
  }, [filteredData]);

  // Pagination logic for the table display
  const paginatedTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tableData.slice(startIndex, startIndex + itemsPerPage);
  }, [tableData, currentPage, itemsPerPage]);

  return {
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
    filteredData,
    tableData,
    paginatedTableData,
    totalPages,
    handleExport,
    handleViewDetails,
    branches: branchesState?.items || [],
  };
};
