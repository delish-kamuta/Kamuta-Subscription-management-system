import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { mealsLogsData } from "app/constants";
import { Search, ChevronDown, Calendar, MoreHorizontal, Download } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { exportToCsv } from "~\/lib\/utils";

const MealsLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState<string>("All");
  const [scannedByFilter, setScannedByFilter] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const itemsPerPage = 8;

  const MONTHS: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  // dateTime format example: "Jan 6, 2022 07:00 AM"
  const toDateKey = (value: string | undefined | null): number | null => {
    if (!value) return null;
    const v = value.trim();
    const [datePart] = v.split(" ").slice(0, 3); // "Jan 6, 2022"
    const cleaned = datePart.replace(",", "");
    const segs = cleaned.split(/\s+/);
    if (segs.length !== 3) return null;
    const mon = MONTHS[segs[0] as keyof typeof MONTHS];
    const d = Number(segs[1]);
    const y = Number(segs[2]);
    if (!mon || !d || !y) return null;
    return y * 10000 + mon * 100 + d;
  };

  const filteredData = mealsLogsData.filter((item) => {
    const matchesSearch = item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || item.clientId.includes(searchTerm);
    const matchesBranch = branchFilter === "All" || item.branch === branchFilter;
    const matchesScannedBy = scannedByFilter === "All" || item.scannedBy === scannedByFilter;
    const itemKey = toDateKey(item.dateTime);
    const fromKey = startDate ? Number(startDate.replace(/-/g, "")) : null; // YYYYMMDD
    const toKey = endDate ? Number(endDate.replace(/-/g, "")) : null;
    const withinRange = (() => {
      if (!itemKey) return true;
      if (fromKey && itemKey < fromKey) return false;
      if (toKey && itemKey > toKey) return false;
      return true;
    })();
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
                <TableHead className="whitespace-nowrap hidden xl:table-cell">Branch</TableHead>
                <TableHead className="whitespace-nowrap">Action</TableHead>
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
                  <TableCell className="hidden xl:table-cell">{item.branch}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
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
    </main>
  );
};

export default MealsLogs;
