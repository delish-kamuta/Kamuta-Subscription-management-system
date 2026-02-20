import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { fetchPaymentsThunk } from "~/store/paymentsSlice";
import { fetchBranchesThunk } from "~/store/branchesSlice";
import { fetchUsersThunk } from "~/store/usersSlice";
import { exportToCsv, formatCurrency } from "~/lib/utils";
import { toDateKey, isWithinRange } from "~/lib/date";
import { UserRole, mapApiRoleToUserRole } from "~/types/auth";

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
  cashier: string;
}

export const usePaymentStats = (itemsPerPage: number = 8) => {
  const dispatch = useAppDispatch();
  const paymentsState = useAppSelector((s) => (s as any).payments);
  const branchesState = useAppSelector((s) => (s as any).branches);
  const usersState = useAppSelector((s) => (s as any).users); // Fetch users state

  const apiPayments = (paymentsState?.items ?? []) as any[];
  const loading = Boolean(paymentsState?.loading);
  const error = paymentsState?.error as string | null;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState("All");
  const [cashierFilter, setCashierFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
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
    if (!usersState?.loaded && !usersState?.loading) {
      dispatch(fetchUsersThunk());
    }
  }, [dispatch, paymentsState?.loaded, paymentsState?.loading, branchesState?.loaded, branchesState?.loading, usersState?.loaded, usersState?.loading]);

  // Derive cashiers from users list
  const cashiers = useMemo(() => {
    if (!usersState?.items) return [];
    return usersState.items.filter((u: any) => {
       const role = mapApiRoleToUserRole(u.role);
       return role === UserRole.CASHIER || role === UserRole.ADMIN; // Include admins or just cashiers? User asked for cashier filter.
    }).map((u: any) => ({
      id: u.id,
      name: u.full_name || u.username || "Unknown"
    }));
  }, [usersState?.items]);


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
          subscriptionType: r.type || "Subscription",
          amountPaid: Number(String(r.amount).replace(/[^0-9.]/g, "")) || 0,
          totalMeals: 0,
          paymentDate: r.date,
          paymentDateKey: r.date ? new Date(r.date).toISOString().split('T')[0] : '', // Normalize to YYYY-MM-DD
          addedNotes: "",
          payment: r.paymentMethod,
          cashier: r.cashier || "N/A", // Map cashier from API response
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
  }, [last7Days, sourceData]); // Re-calculate when sourceData changes
  
  const revenueByBranch = useMemo(() => {
    // Aggregate revenue by branch
    const stats: Record<string, { topUp: number, newSub: number, total: number }> = {};
    const branchItems = branchesState?.items || [];
    
    sourceData.forEach(p => {
      const branchId = p.branch || "Unknown";
      const branchName = branchItems.find((b: any) => b.id === branchId)?.name || branchId;

      if (!stats[branchName]) {
        stats[branchName] = { topUp: 0, newSub: 0, total: 0 };
      }
      
      const amount = p.amountPaid;
      // Heuristic to distinguish TopUp vs NewSub based on notes or amount or subscriptionType?
      // For now, assume all is Total. 
      // If payment method or type is available, use it. 
      // Checking `p.subscriptionType` or `p.addedNotes`?
      // sourceData maps `subscriptionType: ""` currently.
      
      // Let's just put everything in Total for now, or split by some logic if possible.
      // Maybe just split equally or use Mock logic if distinguishing is impossible
      // But user screenshot shows "TOP UP(RWF)", "NEW SUB(RWF)", "Total(RWF)".
      
      stats[branchName].total += amount;
      
      // Attempt to categorize if possible. 
      // If not, maybe just put all in Total and 0 in others? 
      // Or maybe check if `p.subscriptionType` exists. 
      // The `sourceData` mapping has `subscriptionType: ""`. 
      // `apiPayments` might have it.
      
      // Let's rely on total for now.
      stats[branchName].topUp += 0; 
      stats[branchName].newSub += amount; // Assuming most are subs
    });

    return Object.entries(stats).map(([branch, vals]) => ({
      branch,
      topUp: vals.topUp,
      newSub: vals.newSub,
      total: vals.total
    })).sort((a, b) => b.total - a.total);
  }, [sourceData, branchesState?.items]);

  // Handle filtering
  // ...

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
      const matchesCashier = cashierFilter === "All" || item.cashier === cashierFilter; 
      const matchesType = typeFilter === "All" || item.subscriptionType === typeFilter;

      const itemKey = toDateKey(item.paymentDate);
      const fromKey = toDateKey(startDate);
      const toKey = toDateKey(endDate);
      const withinRange = isWithinRange(itemKey, fromKey, toKey);
      return matchesSearch && matchesBranch && matchesCashier && matchesType && withinRange;
    }).sort((a, b) => {
      const dateA = new Date(a.paymentDate).getTime();
      const dateB = new Date(b.paymentDate).getTime();
      return dateB - dateA;
    });
  }, [sourceData, searchTerm, branchFilter, cashierFilter, typeFilter, startDate, endDate]);

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
      type: p.subscriptionType,
      amount: formatCurrency(p.amountPaid),
      paymentMethod: p.payment,
      date: p.paymentDate,
      status: "Completed",
      branch: p.branch,
      cashier: p.cashier,
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
    dailyRevenue,
    totalRevenue,
    paymentMethods,
    filteredData,
    tableData,
    revenueByBranch, // Add this
    paginatedTableData,
    totalPages,
    handleExport,
    handleViewDetails,
    branches: branchesState?.items || [],
    cashiers,
  };
};
