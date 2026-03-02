import { useState } from "react";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Header } from "../../../components/Header";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ChevronRight, ArrowLeft } from "lucide-react";
import dayjs from "dayjs";
import { Badge } from "~/components/ui/badge";
import { useNavigate } from "react-router";
import { Input } from "~/components/ui/input";

// Mock data based on the screenshot
const initialUsageData = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  date: "JAN 6, 2022",
  items: {
    rice: "5 KG",
    carrot: "5 KG",
    eggs: "10",
    milk: "5 L",
  },
  timeSubmitted: "08: 22 AM",
  status: i % 3 === 0 ? "approved" : i % 3 === 1 ? "rejected" : "pending", 
  branch: i % 2 === 0 ? "CAVM" : "RUKARA",
  submittedBy: i % 2 === 0 ? "Frank Gatumba" : "Jane Doe"
}));

export default function IngredientsApprovalPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(initialUsageData);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filters
  const [date, setDate] = useState<string>("");
  const [branch, setBranch] = useState<string>("all");
  const [submittedBy, setSubmittedBy] = useState<string>("all");

  const handleApprove = (id: number) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: "approved" } : item));
  };

  const handleReject = (id: number) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: "rejected" } : item));
  };

  // Unique branches and submitters for filters
  const branches = Array.from(new Set(data.map(item => item.branch)));
  const submitters = Array.from(new Set(data.map(item => item.submittedBy)));

  const filteredData = data.filter(item => {
    const matchesDate = date ? dayjs(item.date).isSame(dayjs(date), 'day') : true; 
    // Branch/Submitter filters hidden but logic kept if needed later
    return matchesDate;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex bg-gray-50 flex-col w-full h-full p-6">
       <div className="flex items-center gap-2 mb-6">
         <SidebarTrigger className="lg:hidden" />
         <div className="flex-1">
           <h1 className="text-2xl font-bold">Dairy Usage Report</h1>
           <p className="text-gray-500">Track activity, trends, and popular destinations in real time</p>
         </div>
       </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input 
          type="date" 
          className="bg-white"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        
        {/* Branch and Submitted By filters removed for Chef view */}
        
        <div className="flex justify-end items-center md:col-start-4">
             <Button variant="ghost" className="text-blue-600 font-medium hover:text-blue-800" onClick={() => navigate("/admin/dairy-usage-report")}>
                View Usage History <ChevronRight className="w-4 h-4 ml-1" />
             </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-bold text-black">DATE</TableHead>
              <TableHead className="font-bold text-black">Rice</TableHead>
              <TableHead className="font-bold text-black">Carrot</TableHead>
              <TableHead className="font-bold text-black">Eggs</TableHead>
              <TableHead className="font-bold text-black">Milk</TableHead>
              <TableHead className="font-bold text-black">TIME SUBMITTED</TableHead>
              <TableHead className="font-bold text-black text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-gray-600">{row.date}</TableCell>
                  <TableCell className="font-bold">{row.items.rice}</TableCell>
                  <TableCell className="font-bold">{row.items.carrot}</TableCell>
                  <TableCell className="font-bold">{row.items.eggs}</TableCell>
                  <TableCell className="font-bold">{row.items.milk}</TableCell>
                  <TableCell className="text-gray-600">{row.timeSubmitted}</TableCell>
                  <TableCell className="text-center">
                    {row.status === "pending" ? (
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-700 hover:bg-green-800 text-white min-w-[80px]"
                          onClick={() => handleApprove(row.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 text-white min-w-[80px]"
                          onClick={() => handleReject(row.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Badge variant={row.status === "approved" ? "default" : "destructive"} className={row.status === "approved" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">No records found</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination - Custom Implementation */}
        <div className="p-4 border-t flex justify-between items-center bg-white">
           <Button 
             variant="outline" 
             size="sm" 
             onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
             disabled={currentPage === 1}
             className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
           </Button>
           
           <div className="flex gap-1">
             {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  const start = Math.min(currentPage - 2, totalPages - 4);
                  p = start + i;
                }
                
                return (
                  <Button 
                    key={p}
                    variant={currentPage === p ? "default" : "ghost"} 
                    size="sm" 
                    className={`w-8 h-8 p-0 ${currentPage === p ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </Button>
                )
             })}
             {totalPages > 5 && currentPage < totalPages - 2 && (
                <div className="flex items-center justify-center w-8 h-8">...</div>
             )}
           </div>
           
           <Button 
             variant="outline" 
             size="sm" 
             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
             disabled={currentPage === totalPages || totalPages === 0}
             className="flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
           </Button>
        </div>
      </div>
    </div>
  );
}
