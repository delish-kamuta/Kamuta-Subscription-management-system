import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import StatsCard from "../../../components/StatsCard";
import { subscriptionStats, subscriptionData } from "app/constants";
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

const Subscription = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = subscriptionData.filter(
    (item) =>
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <main className="dashboard wrapper">
      <Header
        title="Subscription"
        description="Track activity, trends, and popular destinations in real time"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      {/* Stats Cards Section */}
      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {subscriptionStats.map((stat) => (
            <StatsCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              currentDay={stat.currentDay}
              lastDayCount={stat.lastDayCount}
            />
          ))}
        </div>
      </section>

      {/* Subscription Table Section */}
      <section className="mt-6 bg-white rounded-lg shadow-sm ">
        {/* Search and Filters */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="w-full md:flex-1 md:max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name or card ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 border-gray-300"
              />
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
              <Button variant="outline" className="text-sm border-gray-300">
                Subscription <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="text-sm border-gray-300">
                Status <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="text-sm border-gray-300">
                Branch <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="text-sm border-gray-300">
                <Calendar className="w-4 h-4 mr-2" /> Date Range
              </Button>
              <Button variant="outline" className="text-sm border-gray-300">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button className="text-sm text-white bg-primary-100">Add Subscription</Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto text-gray-500">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Reg Number</TableHead>
                <TableHead className="whitespace-nowrap">Client ID</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">Subscription Type</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Date Started</TableHead>
                <TableHead className="whitespace-nowrap hidden xl:table-cell">Last Meal Date</TableHead>
                <TableHead className="whitespace-nowrap">Total Meals</TableHead>
                <TableHead className="whitespace-nowrap">Meals Left</TableHead>
                <TableHead className="whitespace-nowrap">Payment</TableHead>
                <TableHead className="whitespace-nowrap">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="font-medium text-black">{item.clientName}</TableCell>
                  <TableCell className="hidden lg:table-cell">{item.subscriptionType}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{item.dateStarted}</TableCell>
                  <TableCell className="hidden xl:table-cell text-sm">{item.lastMealDate}</TableCell>
                  <TableCell className="font-semibold">{item.totalMeals}</TableCell>
                  <TableCell className="font-semibold">{item.mealsLeft}</TableCell>
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

export default Subscription;
