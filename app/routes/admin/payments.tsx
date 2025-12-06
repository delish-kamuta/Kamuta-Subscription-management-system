import { SidebarTrigger } from "~/components/ui/sidebar";
import { Header } from "../../../components/Header";
import { paymentsData } from "app/constants";
import { Search, ChevronDown, Calendar, MoreHorizontal, Download, Eye, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { exportToCsv } from "~/lib/utils";
import StatsCard from "../../../components/StatsCard";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const itemsPerPage = 8;

  // Financial calculations
  const totalRevenue = paymentsData.reduce((sum, payment) => sum + payment.amountPaid, 0);
  
  // Get today's and yesterday's date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const yesterdayStr = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Calculate today's and yesterday's revenue
  const todayRevenue = paymentsData
    .filter(p => p.paymentDate === todayStr)
    .reduce((sum, p) => sum + p.amountPaid, 0);
    
  const yesterdayRevenue = paymentsData
    .filter(p => p.paymentDate === yesterdayStr)
    .reduce((sum, p) => sum + p.amountPaid, 0);

  // Calculate this week and last week revenue
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  const thisWeekRevenue = paymentsData
    .filter(p => last7Days.includes(p.paymentDate))
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const lastWeekRevenue = paymentsData
    .filter(p => last14Days.slice(7).includes(p.paymentDate))
    .reduce((sum, p) => sum + p.amountPaid, 0);

  // Count today's and yesterday's payments
  const todayPaymentsCount = paymentsData.filter(p => p.paymentDate === todayStr).length;
  const yesterdayPaymentsCount = paymentsData.filter(p => p.paymentDate === yesterdayStr).length;

  // Calculate daily revenue for chart
  const dailyRevenue = last7Days.reverse().map(dateStr => ({
    date: dateStr,
    amount: paymentsData
      .filter(p => p.paymentDate === dateStr)
      .reduce((sum, p) => sum + p.amountPaid, 0)
  }));

  // Payment method breakdown
  const paymentMethods = paymentsData.reduce((acc, payment) => {
    const method = payment.payment;
    acc[method] = (acc[method] || 0) + payment.amountPaid;
    return acc;
  }, {} as Record<string, number>);

  // Top 5 high-value payments
  const topPayments = [...paymentsData]
    .sort((a, b) => b.amountPaid - a.amountPaid)
    .slice(0, 5);

  const filteredData = paymentsData.filter(
    (item) =>
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.paymentId.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
      "Payment Method"
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
      item.payment
    ]);
    exportToCsv(headers, rows, "payments");
  };

  return (
    <main className="dashboard wrapper">
      <Header
        title="All Payments"
        description="Track activity, trends, and popular destinations in real time"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      {/* Financial Summary Section */}
      <section className="mt-6 space-y-6">
        {/* Revenue Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Revenue"
            value={totalRevenue}
            currentDay={todayRevenue}
            lastDayCount={yesterdayRevenue}
          />
          <StatsCard
            title="Weekly Revenue"
            value={thisWeekRevenue}
            currentDay={thisWeekRevenue}
            lastDayCount={lastWeekRevenue}
          />
          <StatsCard
            title="Total Payments"
            value={paymentsData.length}
            currentDay={todayPaymentsCount}
            lastDayCount={yesterdayPaymentsCount}
          />
        </div>

        {/* Daily Revenue & Payment Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Revenue Chart */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Daily Revenue (Last 7 Days)</h3>
            <div className="space-y-3">
              {dailyRevenue.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-24">{day.date}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${(day.amount / Math.max(...dailyRevenue.map(d => d.amount))) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                    {day.amount.toLocaleString()} Rwf
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Payment Method Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(paymentMethods).map(([method, amount], idx) => {
                const percentage = ((amount / totalRevenue) * 100).toFixed(1);
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500'];
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{method}</span>
                      <span className="text-sm font-semibold text-gray-900">{amount.toLocaleString()} Rwf</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${colors[idx % colors.length]} h-full rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Payments Table Section */}
      <section className="mt-6 bg-white rounded-lg shadow-sm ">
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
              <Button variant="outline" className="text-sm border-gray-300">
                Branch <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="text-sm border-gray-300">
                Cashier <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="text-sm border-gray-300">
                <Calendar className="w-4 h-4 mr-2" /> Date Range
              </Button>
              <Button variant="outline" className="text-sm border-gray-300" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-gray-500 ">
                <TableHead className="whitespace-nowrap">Payment ID</TableHead>
                <TableHead className="whitespace-nowrap">Client Name</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Branch</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">Subscription Type</TableHead>
                <TableHead className="whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap hidden xl:table-cell">Total Meals</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">Payment Date</TableHead>
                <TableHead className="whitespace-nowrap hidden xl:table-cell">Notes</TableHead>
                <TableHead className="whitespace-nowrap">Payment</TableHead>
                <TableHead className="whitespace-nowrap">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-gray-500 ">
              {paginatedData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">{item.paymentId}</TableCell>
                  <TableCell className="font-medium text-black">{item.clientName}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.branch}</TableCell>
                  <TableCell className="hidden lg:table-cell">{item.subscriptionType}</TableCell>
                  <TableCell className="font-semibold">{item.amountPaid}</TableCell>
                  <TableCell className="hidden xl:table-cell">{item.totalMeals}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{item.paymentDate}</TableCell>
                  <TableCell className="hidden xl:table-cell text-sm text-gray-500">
                    {item.addedNotes}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                        item.payment === "Cash"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.payment}
                    </span>
                  </TableCell>
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
                                if (confirm(`Are you sure you want to delete payment for ${item.clientName}?`)) {
                                  console.log('Deleting payment:', item.paymentId);
                                  alert(`Payment for ${item.clientName} has been deleted`);
                                  // TODO: Dispatch Redux action to delete payment
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
            {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map((page) => (
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
            <SheetTitle>Payment Details</SheetTitle>
            <SheetDescription>Complete information about this payment</SheetDescription>
          </SheetHeader>
          {selectedItem && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment ID</label>
                  <p className="text-base font-mono">{selectedItem.paymentId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Client Name</label>
                  <p className="text-base font-medium">{selectedItem.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Branch</label>
                  <p className="text-base">{selectedItem.branch}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subscription Type</label>
                  <p className="text-base">{selectedItem.subscriptionType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount Paid</label>
                  <p className="text-base font-semibold text-green-600">{selectedItem.amountPaid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Meals</label>
                  <p className="text-base">{selectedItem.totalMeals}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Date</label>
                  <p className="text-base">{selectedItem.paymentDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-base">{selectedItem.payment}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-base text-gray-700">{selectedItem.addedNotes}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="overflow-y-auto  bg-white p-6">
          <SheetHeader>
            <SheetTitle>Edit Payment</SheetTitle>
            <SheetDescription>Update payment information</SheetDescription>
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
              <div>
                <label className="text-sm font-medium">Subscription Type</label>
                <select
                  value={editForm.subscriptionType}
                  onChange={(e) => setEditForm({ ...editForm, subscriptionType: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option>Daily (Lunch)</option>
                  <option>Daily (Lunch + Dinner)</option>
                  <option>Weekly (Lunch)</option>
                  <option>Monthly (Lunch)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Amount Paid</label>
                  <Input
                    value={editForm.amountPaid}
                    onChange={(e) => setEditForm({ ...editForm, amountPaid: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Meals</label>
                  <Input
                    type="number"
                    value={editForm.totalMeals}
                    onChange={(e) => setEditForm({ ...editForm, totalMeals: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <select
                  value={editForm.payment}
                  onChange={(e) => setEditForm({ ...editForm, payment: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option>Cash</option>
                  <option>Mobile Money</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={editForm.addedNotes}
                  onChange={(e) => setEditForm({ ...editForm, addedNotes: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    console.log('Updating payment:', editForm);
                    alert(`Payment for ${editForm.clientName} has been updated`);
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

export default Payments;
