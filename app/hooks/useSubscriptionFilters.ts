import { useMemo, useState } from "react";
import { toDateKey, isWithinRange } from "~/lib/date";

// Shape of a subscription item (partial - extend if needed)
export interface SubscriptionItem {
  id: string;
  // Optional backend user ID (UUID) for QR-OTP generation
  userId?: string;
  tel: string;
  clientName: string;
  subscriptionType: string;
  customerType: string;
  dateStarted: string;
  branch?: string;
  totalMeals: number;
  mealsLeft: number;
  payment: string;
}

export interface UseSubscriptionFiltersOptions {
  data: SubscriptionItem[];
  pageSize?: number;
}

export interface SubscriptionFiltersState {
  searchTerm: string;
  subscriptionTypeFilter: string;
  customerTypeFilter: string;
  startDate: string; // ISO yyyy-mm-dd or ''
  endDate: string;   // ISO yyyy-mm-dd or ''
  currentPage: number;
}

export interface SubscriptionFiltersSetters {
  setSearchTerm: (v: string) => void;
  setSubscriptionTypeFilter: (v: string) => void;
  setCustomerTypeFilter: (v: string) => void;
  setStartDate: (v: string) => void;
  setEndDate: (v: string) => void;
  setCurrentPage: (v: number) => void;
  clearDates: () => void;
}

export interface UseSubscriptionFiltersResult {
  state: SubscriptionFiltersState;
  setters: SubscriptionFiltersSetters;
  filteredData: SubscriptionItem[];
  paginatedData: SubscriptionItem[];
  totalPages: number;
  exportRows: (includeBranch: boolean) => Array<Array<unknown>>;
}

export function useSubscriptionFilters({ data, pageSize = 8 }: UseSubscriptionFiltersOptions): UseSubscriptionFiltersResult {
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionTypeFilter, setSubscriptionTypeFilter] = useState("All");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Derived filtered dataset
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || item.tel.includes(searchTerm);
      const matchesCustomerType = customerTypeFilter === "All" || item.customerType === customerTypeFilter;
      const matchesSubscriptionType = subscriptionTypeFilter === "All" || item.subscriptionType === subscriptionTypeFilter;
      const itemKey = toDateKey(item.dateStarted);
      const fromKey = toDateKey(startDate);
      const toKey = toDateKey(endDate);
      const withinRange = isWithinRange(itemKey, fromKey, toKey);
      return matchesSearch && matchesCustomerType && matchesSubscriptionType && withinRange;
    });
  }, [data, searchTerm, customerTypeFilter, subscriptionTypeFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  // Clamp currentPage when filteredData shrinks
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const exportRows = (includeBranch: boolean) => {
    return filteredData.map(item => [
      item.tel,
      item.clientName,
      item.subscriptionType,
      item.customerType,
      item.dateStarted,
      ...(includeBranch ? [item.branch ?? ""] : []),
      item.totalMeals,
      item.mealsLeft,
      item.payment,
    ]);
  };

  return {
    state: {
      searchTerm,
      subscriptionTypeFilter,
      customerTypeFilter,
      startDate,
      endDate,
      currentPage,
    },
    setters: {
      setSearchTerm,
      setSubscriptionTypeFilter,
      setCustomerTypeFilter,
      setStartDate,
      setEndDate,
      setCurrentPage,
      clearDates,
    },
    filteredData,
    paginatedData,
    totalPages,
    exportRows,
  };
}
