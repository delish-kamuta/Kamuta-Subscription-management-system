import { useNavigate } from "react-router";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Header } from "../../../components/Header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ArrowLeft, ChevronDown, TrendingUp } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function ViewProfitReport() {
  const navigate = useNavigate();

  // Mock Data
  const profitData = {
      amount: "12,450 RWF",
      trend: "12% vs last month"
  };

  const branchRevenues = [
      { name: "CAVM", amount: 1000, max: 1200 },
      { name: "CAVM", amount: 1000, max: 1200 }, // Intentionally duplicated per screenshot? Assuming placeholder name
      { name: "CAVM", amount: 1000, max: 1200 }
  ];

  const dateRevenues = [
      { date: "2026-02-08", amount: 1000, max: 1200 },
      { date: "2026-02-09", amount: 100, max: 1200 },
      { date: "2026-02-10", amount: 100, max: 1200 },
  ];

  const profitByBranch = [
      { branch: "CAVM", regular: 20, vip: 20, vvip: 20 },
      { branch: "Downtown", regular: 12, vip: 12, vvip: 12 },
      { branch: "Kimironko", regular: 68, vip: 68, vvip: 68 },
  ];

  const monthlyRevenueData = [
      { name: 'Jan', value: 1600 },
      { name: 'Feb', value: 1200 },
      { name: 'Mar', value: 3000 },
      { name: 'Apr', value: 1400 },
      { name: 'May', value: 2000 },
      { name: 'Jun', value: 1800 },
  ];

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6 bg-slate-50 min-h-screen">
      
       <div className="flex flex-col items-center gap-4">
          <Header
            title="View Profit Report"
            description="Track activity, trends, and popular destinations in real time"
            action={
              <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
            }
          />
           <div className="w-full p-0 flex justify-between items-center">
                <Button variant="ghost" size="icon" className="flex justify-start pl-0 hover:bg-transparent hover:text-blue-600 w-auto" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5 mr-2" /> Back
                </Button>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="min-w-[120px] justify-between bg-white">
                            Week <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Week</DropdownMenuItem>
                        <DropdownMenuItem>Month</DropdownMenuItem>
                        <DropdownMenuItem>Year</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
      </div>

        {/* Top Section: Profit & Branch Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Card */}
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-8 flex flex-col justify-center h-full min-h-[250px]">
                     <span className="text-gray-600 font-medium mb-4">Profit</span>
                     <span className="text-5xl font-bold text-gray-900 mb-4">{profitData.amount}</span>
                     <div className="flex items-center gap-2 text-green-600 font-medium">
                        <TrendingUp className="h-5 w-5" />
                        {profitData.trend}
                     </div>
                </CardContent>
            </Card>

            {/* Branch's Revenue */}
            <Card className="border-slate-100 shadow-sm">
                 <CardHeader>
                     <CardTitle className="text-base font-bold text-gray-900">Branch's Revenue</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6">
                     {branchRevenues.map((item, index) => (
                         <div key={index} className="space-y-2">
                             <div className="flex justify-between text-sm font-semibold">
                                 <span>{item.name}</span>
                                 <span>{item.amount} RWF</span>
                             </div>
                             <Progress value={(item.amount / item.max) * 100} className="h-4 bg-slate-200" />
                         </div>
                     ))}
                     <Button variant="link" className="px-0 text-blue-600 font-medium">
                         View More +
                     </Button>
                 </CardContent>
            </Card>
        </div>

        {/* Middle Section: Revenue History & Profit Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Revenue History */}
             <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-bold text-gray-900">Revenue (This week | Month | Year | Weeks)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {dateRevenues.map((item, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm font-semibold">
                                <span>{item.date}</span>
                                <span>{item.amount} RWF</span>
                            </div>
                            <Progress value={(item.amount / item.max) * 100} className="h-2 bg-slate-200" />
                        </div>
                    ))}
                </CardContent>
             </Card>

             {/* Profit Generated by Branch Table */}
             <Card className="border-slate-100 shadow-sm overflow-hidden">
                <CardHeader>
                     <CardTitle className="text-base font-bold text-gray-900">Profit Generated by Branch</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-100">
                                <TableHead className="text-gray-500 font-medium pl-6">Branch</TableHead>
                                <TableHead className="text-gray-500 font-medium">Regular</TableHead>
                                <TableHead className="text-gray-500 font-medium">VIP</TableHead>
                                <TableHead className="text-gray-500 font-medium pr-6">VVIP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profitByBranch.map((row, index) => (
                                <TableRow key={index} className="border-b border-gray-50 last:border-0 hover:bg-slate-50">
                                    <TableCell className="font-medium pl-6">{row.branch}</TableCell>
                                    <TableCell>{row.regular}</TableCell>
                                    <TableCell>{row.vip}</TableCell>
                                    <TableCell className="pr-6">{row.vvip}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </div>

        {/* Bottom Section: Monthly Revenue Chart */}
        <Card className="border-slate-100 shadow-sm max-w-2xl">
            <CardHeader>
                <CardTitle className="text-base font-bold text-gray-900">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={monthlyRevenueData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748B', fontSize: 12 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748B', fontSize: 12 }} 
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#1E293B' }}
                                formatter={(value: number) => [`${value} RWF`, 'Revenue']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#3B82F6" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

    </main>
  );
}
