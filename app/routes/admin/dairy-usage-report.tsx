import { SidebarTrigger } from "~/components/ui/sidebar";
import { Header } from "../../../components/Header";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ChevronDown, MoreHorizontal, Calendar as CalendarIcon, ArrowLeft, FilterX } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import dayjs from "dayjs";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function DairyUsageReport() {
  const navigate = useNavigate();

  // Mock data matching the screenshot
  const usageData = [
    {
      id: 1,
      date: "JAN 6, 2022",
      rice: "5 KG",
      carrot: "5 KG",
      eggs: "10",
      milk: "5 L",
      totalCost: "100,500",
      branch: "CAVM",
      submittedBy: "Frank Gatumba",
      timeSubmitted: "08: 22 AM",
    },
    {
      id: 2,
      date: "JAN 6, 2022",
      rice: "5 KG",
      carrot: "5 KG",
      eggs: "10",
      milk: "5 L",
      totalCost: "100,500",
      branch: "RUKARA",
      submittedBy: "Frank Gatumba",
      timeSubmitted: "08: 22 AM",
    },
    {
      id: 3,
      date: "JAN 6, 2022",
      rice: "5 KG",
      carrot: "5 KG",
      eggs: "10",
      milk: "5 L",
      totalCost: "100,500",
      branch: "RUKARA",
      submittedBy: "Frank Gatumba",
      timeSubmitted: "08: 22 AM",
    },
     // Add more rows to simulate list
     {
      id: 4,
      date: "JAN 6, 2022",
      rice: "5 KG",
      carrot: "5 KG",
      eggs: "10",
      milk: "5 L",
      totalCost: "100,500",
      branch: "BUSOGO",
      submittedBy: "Jane Doe",
      timeSubmitted: "09: 10 AM",
    },
  ];

  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedStaff, setSelectedStaff] = useState("All Staff");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = usageData.filter((item) => {
    const matchBranch = selectedBranch === "All Branches" || item.branch === selectedBranch;
    const matchStaff = selectedStaff === "All Staff" || item.submittedBy === selectedStaff;
    const matchDate = !selectedDate || dayjs(item.date).isSame(dayjs(selectedDate), 'day');
    return matchBranch && matchStaff && matchDate;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const uniqueBranches = Array.from(new Set(usageData.map(item => item.branch)));
  const uniqueStaff = Array.from(new Set(usageData.map(item => item.submittedBy)));

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6">
       <div className="flex flex-col gap-4 w-full">
          <Header
            title="Dairy Usage Report"
            description="Track activity, trends, and popular destinations in real time"
            action={
              <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
            }
          />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
            {/* Date Picker */}
            <div className={`relative min-w-[200px] ${selectedDate ? "text-gray-900" : "text-gray-500"}`}>
               <Input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`min-w-[200px] ${selectedDate ? "border-blue-200 bg-blue-50 text-gray-900" : ""}`}
               />
               {!selectedDate && (
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                 </span>
               )}
            </div>

            {/* Branch Dropdown */}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={`justify-between min-w-[200px] font-normal ${selectedBranch !== "All Branches" ? "text-gray-900 border-blue-200 bg-blue-50" : "text-gray-500"}`}>
                        <span>{selectedBranch === "All Branches" ? "Branch" : selectedBranch}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px] bg-white border border-slate-200">
                    <DropdownMenuItem onSelect={() => setSelectedBranch("All Branches")}>All Branches</DropdownMenuItem>
                    {uniqueBranches.map((branch) => (
                      <DropdownMenuItem key={branch} onSelect={() => setSelectedBranch(branch)}>
                        {branch}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>


            {/* Submitted By Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button variant="outline" className={`justify-between min-w-[200px] font-normal ${selectedStaff !== "All Staff" ? "text-gray-900 border-blue-200 bg-blue-50" : "text-gray-500"}`}>
                        <span>{selectedStaff === "All Staff" ? "Submitted By" : selectedStaff}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px] bg-white border border-slate-200">
                     <DropdownMenuItem onSelect={() => setSelectedStaff("All Staff")}>All Staff</DropdownMenuItem>
                     {uniqueStaff.map((staff) => (
                       <DropdownMenuItem key={staff} onSelect={() => setSelectedStaff(staff)}>
                         {staff}
                       </DropdownMenuItem>
                     ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {(selectedBranch !== "All Branches" || selectedStaff !== "All Staff" || selectedDate) && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setSelectedBranch("All Branches");
                  setSelectedStaff("All Staff");
                  setSelectedDate("");
                }}
                className="text-red-500 hover:text-red-600  hover:bg-red-50"
                title="Clear filters"
              >
                <FilterX className="h-4 w-4" />
              </Button>
            )}
        </div>

        <Button variant="link" className="text-blue-600 font-medium px-0 self-end sm:self-auto">
            View Usage History &gt;
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-gray-900">DATE</TableHead>
              <TableHead className="font-bold text-gray-900">Rice</TableHead>
              <TableHead className="font-bold text-gray-900">Carrot</TableHead>
              <TableHead className="font-bold text-gray-900">Eggs</TableHead>
              <TableHead className="font-bold text-gray-900">Milk</TableHead>
              <TableHead className="font-bold text-gray-900">Total Cost(RWF)</TableHead>
              <TableHead className="font-bold text-gray-900">Branch</TableHead>
              <TableHead className="font-bold text-gray-900">Submitted By</TableHead>
              <TableHead className="font-bold text-gray-900">TIME SUBMITTED</TableHead>
              <TableHead className="font-bold text-gray-900 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-gray-500 font-medium">{row.date}</TableCell>
                <TableCell className="font-semibold">{row.rice}</TableCell>
                <TableCell className="font-semibold">{row.carrot}</TableCell>
                <TableCell className="font-semibold">{row.eggs}</TableCell>
                <TableCell className="font-semibold">{row.milk}</TableCell>
                <TableCell className="font-bold">{row.totalCost}</TableCell>
                <TableCell className="font-semibold">{row.branch}</TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{row.submittedBy.split(" ")[0]}</span>
                        <span className="text-gray-500 text-xs">{row.submittedBy.split(" ")[1]}</span>
                    </div>
                </TableCell>
                <TableCell className="text-gray-500">{row.timeSubmitted}</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-5 w-5 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Report</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-gray-500">
                  No records found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100">
             <Button 
                variant="outline" 
                className="text-gray-600 gap-2 pl-2.5"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
             >
                <ArrowLeft className="h-4 w-4" /> Previous
             </Button>
             
             <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    className={`h-8 w-8 p-0 ${currentPage === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-slate-100"}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
             </div>

             <Button 
                variant="outline" 
                className="text-gray-600 gap-2 pr-2.5"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
             >
                Next <ArrowLeft className="h-4 w-4 rotate-180" />
             </Button>
        </div>
      </div>
    </main>
  );
}
