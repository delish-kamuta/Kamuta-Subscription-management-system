import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { mealsLogsData } from "app/constants";
import { Search, Calendar, MoreHorizontal, Download, Eye, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
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

const MealsLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState<string>("All");
  const [scannedByFilter, setScannedByFilter] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const itemsPerPage = 8;
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    
    const userName = user?.name || "Guest";
    const userRole = user?.role || UserRole.CASHIER;
    const isCashier = userRole === UserRole.CASHIER;

  // Use shared date utils for consistent range filtering

  const filteredData = mealsLogsData.filter((item) => {
    const matchesSearch = item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || item.clientId.includes(searchTerm);
    const matchesBranch = branchFilter === "All" || item.branch === branchFilter;
    const matchesScannedBy = scannedByFilter === "All" || item.scannedBy === scannedByFilter;
    const itemKey = toDateKey(item.dateTime);
    const fromKey = toDateKey(startDate);
    const toKey = toDateKey(endDate);
    const withinRange = isWithinRange(itemKey, fromKey, toKey);
    return matchesSearch && matchesBranch && matchesScannedBy && withinRange;
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
    const rows = filteredData.map((item) => {
      const dateSegs = item.dateTime.split(" ");
      const dateStr = `${dateSegs[0]} ${dateSegs[1]} ${dateSegs[2]}`;
      const timeStr = `${dateSegs[3]} ${dateSegs[4] ?? ""}`.trim();
      return [
        item.clientId,
        item.clientName,
        item.mealUsed,
        item.mealsLeft,
        dateStr,
        timeStr,
        item.scannedBy,
        item.branch,
      ];
    });
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
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 border-gray-300"
              />
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
              <div className="relative">
                {!isCashier&&(
                  <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="All">Branch: All</option>
                  <option value="KIGALI">KIGALI</option>
                  <option value="HUYE">HUYE</option>
                  <option value="MUSANZE">MUSANZE</option>
                  <option value="RUBAVU">RUBAVU</option>
                  <option value="NYARUGENGE">NYARUGENGE</option>
                  <option value="GASABO">GASABO</option>
                  <option value="KICUKIRO">KICUKIRO</option>
                  <option value="RUSIZI">RUSIZI</option>
                </select>
                )}
              </div>
              <div className="relative">
                <select
                  value={scannedByFilter}
                  onChange={(e) => setScannedByFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="All">Scanned By: All</option>
                  <option value="James Anderson">James Anderson</option>
                  <option value="Michael Johnson">Michael Johnson</option>
                  <option value="David Brown">David Brown</option>
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

        {/* Table */}
        <div className="overflow-x-auto text-gray-500">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Client ID</TableHead>
                <TableHead className="whitespace-nowrap">Client Name</TableHead>
                <TableHead className="whitespace-nowrap">Meal Used</TableHead>
                <TableHead className="whitespace-nowrap">Meals Left</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">Date & Time</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Scanned By</TableHead>
                {!isCashier&&(
                  <TableHead className="whitespace-nowrap hidden xl:table-cell">Branch</TableHead>
                )}
                {!isCashier&&(
                  <TableHead className="whitespace-nowrap">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">{item.clientId}</TableCell>
                  <TableCell className="font-medium text-black">{item.clientName}</TableCell>
                  <TableCell className="font-semibold">{item.mealUsed}</TableCell>
                  <TableCell className="font-semibold">{item.mealsLeft}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {item.dateTime.split(" ")[0]}{" "}
                        {item.dateTime.split(" ")[1]}{" "}
                        {item.dateTime.split(" ")[2]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.dateTime.split(" ")[3]}{" "}
                        {item.dateTime.split(" ")[4]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{item.scannedBy}</TableCell>
                  {!isCashier&&(
                    <TableCell className="hidden xl:table-cell">{item.branch}</TableCell>
                  )}
                  {!isCashier&&(
                    <TableCell>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {openDropdown === index && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setViewDetailsOpen(true);
                                  setOpenDropdown(null);
                                }}
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                                View Details
                              </button>
                              <button
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2"
                                onClick={() => {
                                  setEditForm(item);
                                  setEditOpen(true);
                                  setOpenDropdown(null);
                                }}
                              >
                                <Edit className="h-4 w-4 text-gray-600" />
                                Edit
                              </button>
                              <button
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                onClick={() => {
                                  setOpenDropdown(null);
                                  if (confirm(`Are you sure you want to delete meal log for ${item.clientName}?`)) {
                                    console.log('Deleting meal log:', item.clientId);
                                    alert(`Meal log for ${item.clientName} has been deleted`);
                                    // TODO: Dispatch Redux action to delete meal log
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
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

      {/* View Details Sheet */}
      <Sheet open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <SheetContent className="overflow-y-auto bg-white p-6">
          <SheetHeader>
            <SheetTitle>Meal Log Details</SheetTitle>
            <SheetDescription>Complete information about this meal log entry</SheetDescription>
          </SheetHeader>
          {selectedItem && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Client ID</label>
                  <p className="text-base font-mono">{selectedItem.clientId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Client Name</label>
                  <p className="text-base font-medium">{selectedItem.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Meal Used</label>
                  <p className="text-base font-semibold">{selectedItem.mealUsed}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Meals Left</label>
                  <p className="text-base font-semibold text-green-600">{selectedItem.mealsLeft}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date & Time</label>
                  <p className="text-base">{selectedItem.dateTime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Scanned By</label>
                  <p className="text-base">{selectedItem.scannedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Branch</label>
                  <p className="text-base">{selectedItem.branch}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="overflow-y-auto bg-white p-6">
          <SheetHeader>
            <SheetTitle>Edit Meal Log</SheetTitle>
            <SheetDescription>Update meal log information</SheetDescription>
          </SheetHeader>
          {editForm && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Client Name</label>
                <Input
                  value={editForm.clientName}
                  onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Meal Used</label>
                  <Input
                    type="number"
                    value={editForm.mealUsed}
                    onChange={(e) => setEditForm({ ...editForm, mealUsed: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Meals Left</label>
                  <Input
                    type="number"
                    value={editForm.mealsLeft}
                    onChange={(e) => setEditForm({ ...editForm, mealsLeft: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Scanned By</label>
                <Input
                  value={editForm.scannedBy}
                  onChange={(e) => setEditForm({ ...editForm, scannedBy: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Branch</label>
                <select
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option>KIGALI</option>
                  <option>HUYE</option>
                  <option>MUSANZE</option>
                  <option>RUBAVU</option>
                  <option>NYARUGENGE</option>
                  <option>GASABO</option>
                  <option>KICUKIRO</option>
                  <option>RUSIZI</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    console.log('Updating meal log:', editForm);
                    alert(`Meal log for ${editForm.clientName} has been updated`);
                    setEditOpen(false);
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button onClick={() => setEditOpen(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
};

export default MealsLogs;
