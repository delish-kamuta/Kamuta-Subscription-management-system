import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Search, Calendar, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { UserRole } from "~/types/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { exportToCsv } from "~\/lib\/utils";
import { toDateKey, isWithinRange } from "~\/lib\/date";
import { useAppSelector } from "~/store/hooks";
import { useAppDispatch } from "~/store/hooks";
import { fetchUsersThunk } from "~/store/usersSlice";
import { fetchBranchesThunk } from "~/store/branchesSlice";
import { listMealLogs, type MealLogItem, type MealLogsQuery } from "~/services/mealLogs";

const MealsLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("");
  const [mealTypeFilter, setMealTypeFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [items, setItems] = useState<MealLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 8;
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const branches = useAppSelector((state) => state.branches.items);
  const branchesLoaded = useAppSelector((state) => state.branches.loaded);
  const users = useAppSelector((state) => state.users.items);
  const usersLoaded = useAppSelector((state) => state.users.loaded);

  const resolveBranchName = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach(b => map.set(String(b.id), String(b.name || '')));
    return (id?: string | number | null) => {
      const key = id != null ? String(id) : '';
      return map.get(key) || '';
    };
  }, [branches]);

  const resolveUserName = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach(u => map.set(String(u.id), String(u.full_name || '')));
    return (id?: string | number | null) => {
      const key = id != null ? String(id) : '';
      return map.get(key) || '';
    };
  }, [users]);
    
    const userName = user?.name || "Guest";
    const userRole = user?.role || UserRole.CASHIER;
    const isCashier = userRole === UserRole.CASHIER;

  // Build role-aware query from filters
  const query: MealLogsQuery = useMemo(() => {
    const base: MealLogsQuery = {
      client_type: clientTypeFilter || undefined,
      meal_type: mealTypeFilter || undefined,
      deduction_source: sourceFilter || undefined,
    };
    if (userRole === UserRole.ADMIN) {
      if (branchFilter) base.branch_id = branchFilter;
    } else if (userRole === UserRole.CASHIER) {
      if (user?.branch_id) base.branch_id = String(user.branch_id);
    } else if (userRole === UserRole.WAITSTAFF) {
      base.scanned_by = String(user?.id || "");
    } else {
      base.client_user_id = String(user?.id || "");
    }
    return base;
  }, [clientTypeFilter, mealTypeFilter, sourceFilter, branchFilter, userRole, user]);

  useEffect(() => {
    // Ensure names are resolvable by preloading users and branches
    if (!usersLoaded) dispatch(fetchUsersThunk());
    if (!branchesLoaded) dispatch(fetchBranchesThunk());

    let mounted = true;
    setLoading(true);
    setError(null);
    listMealLogs(query)
      .then((res) => {
        if (!mounted) return;
        if (!res.success) { setError(res.message || 'Failed to fetch meal logs'); setItems([]); return; }
        setItems(res.data || []);
      })
      .catch((e) => { if (mounted) setError(String(e.message || e)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [query]);

  const filteredData = items.filter((item) => {
    const matchesSearch = [item.id, item.client_user_id].some((v) => String(v || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const itemKey = toDateKey(item.created_at);
    const fromKey = toDateKey(startDate);
    const toKey = toDateKey(endDate);
    const withinRange = isWithinRange(itemKey, fromKey, toKey);
    return matchesSearch && withinRange;
  });
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleExport = () => {
    const headers = [
      "Client ID",
      "Client Name",
      "Meal Used",
      "Meals Left",
      "Date",
      "Time",
      "Scanned By",
      "Branch",
    ];
    const rows = filteredData.map((item) => [
      item.client_user_id || '',
      item.client_type,
      item.meal_type,
      item.deduction_source,
      new Date(item.created_at).toLocaleDateString(),
      new Date(item.created_at).toLocaleTimeString(),
      item.scanned_by || '',
      item.branch_id || '',
    ]);
    exportToCsv(headers, rows, "meals_logs");
  };

  return (
    <main className="dashboard wrapper">
      <Header
        title="Meal Logs"
        description="Track activity, trends, and popular destinations in real time"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      {/* Meals Logs Table Section */}
      <section className="mt-6 bg-white rounded-lg shadow-sm">
        {/* Search and Filters */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="w-full md:flex-1 md:max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by Log ID or Client User ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 border-gray-300"
              />
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
              <div className="relative">
                {userRole === UserRole.ADMIN && (
                  <Input
                    placeholder="Branch ID"
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="text-sm border-gray-300"
                  />
                )}
              </div>
              <div className="relative">
                <select
                  value={clientTypeFilter}
                  onChange={(e) => setClientTypeFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="">Client Type: All</option>
                  <option value="student">Student</option>
                  <option value="worker">Worker</option>
                  <option value="irregular_client">Irregular Client</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={mealTypeFilter}
                  onChange={(e) => setMealTypeFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="">Meal Type: All</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="VVIP">VVIP</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="">Source: All</option>
                  <option value="subscription">Subscription</option>
                  <option value="prepaid">Prepaid</option>
                  <option value="credit">Credit</option>
                  <option value="paid_ticket">Paid Ticket</option>
                </select>
              </div>
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
              <Button variant="outline" className="text-sm border-gray-300" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Client Name</TableHead>
                <TableHead className="whitespace-nowrap">Client Type</TableHead>
                <TableHead className="whitespace-nowrap">Meal Type</TableHead>
                <TableHead className="whitespace-nowrap">Source</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">Date & Time</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Scanned By</TableHead>
                {!isCashier && (
                  <TableHead className="whitespace-nowrap hidden xl:table-cell">Branch</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData
                .slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm font-medium">{resolveUserName((item as any).client_user_id)}</TableCell>
                    <TableCell className="text-sm">{item.client_type}</TableCell>
                    <TableCell className="text-sm">{item.meal_type}</TableCell>
                    <TableCell className="text-sm">{item.deduction_source}</TableCell>
                    <TableCell className="whitespace-nowrap hidden lg:table-cell text-sm">{new Date(item.created_at).toLocaleString()}</TableCell>
                    <TableCell className="whitespace-nowrap hidden md:table-cell text-sm">{resolveUserName(item.scanned_by) || (item.scanned_by ? String(item.scanned_by) : "")}</TableCell>
                    {!isCashier && (
                      <TableCell className="whitespace-nowrap hidden xl:table-cell text-sm">{resolveBranchName(item.branch_id)}</TableCell>
                    )}
                  </TableRow>
                ))}
              {!loading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-500">
                    No logs found
                  </TableCell>
                </TableRow>
              )}
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

      {/* View/Edit sheets removed (legacy UI causing compile errors) */}
    </main>
  );
};

export default MealsLogs;
