import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import StatsCard from "../../../components/StatsCard"
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend, Label } from "recharts"
import { Skeleton } from "~/components/ui/skeleton"
import { useBranchPerformance } from "~/hooks/useBranchPerformance"

interface BranchPerformanceProps {
  branchId?: string;
  timeRange?: string;
}

export function BranchPerformance({ branchId, timeRange }: BranchPerformanceProps) {
  const { data, processedData, loading, error } = useBranchPerformance({ branchId, timeRange });

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[140px] rounded-xl" />
          <Skeleton className="h-[140px] rounded-xl" />
          <Skeleton className="h-[140px] rounded-xl" />
        </div>

        {/* Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>

        {/* Charts & Insights Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !data || !processedData) return <div className="p-4 text-red-500 font-medium">Error: {error || "Failed to load data"}</div>

  const { branchPerformance, totalServed, totalRevenue, pieData } = processedData;

  const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6'  // Teal
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const toolTipData = payload[0].payload
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
          <p className="font-semibold mb-1">{toolTipData.name}</p>
          <div className="space-y-1 text-slate-600">
            <p>Served: <span className="font-medium text-slate-900">{toolTipData.value.toLocaleString()}</span></p>
            <p>Share: <span className="font-medium text-slate-900">{toolTipData.percentage}%</span></p>
            <p>Revenue: <span className="font-medium text-slate-900">RWF {toolTipData.revenue.toLocaleString()}</span></p>
          </div>
        </div>
      )
    }
    return null
  }

  // Helper to parse insight text into icon logic (simple heuristic)
  const getInsightIcon = (text: string) => {
     const lower = text.toLowerCase();
     if (lower.includes('served') || lower.includes('most')) {
         return (
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V21"/></svg>
            </div>
         )
     }
     if (lower.includes('revenue') || lower.includes('contributed') || lower.includes('subscription')) {
         return (
            <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
         )
     }
     // Default / Time related
     return (
        <div className="p-2 bg-gray-100 rounded-full text-gray-600">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
     )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="People Served"
          value={totalServed.toLocaleString()}
          currentDay={totalServed}
          lastDayCount={Math.round(totalServed / (1 + ((data.summary?.people_served?.change_percent || 0) / 100)))} 
        />
        <StatsCard
          title="Total Revenue"
          value={`RWF ${totalRevenue.toLocaleString()}`}
          currentDay={totalRevenue}
          lastDayCount={Math.round(totalRevenue / (1 + ((data.summary?.total_revenue?.change_percent || 0) / 100)))}
        />
        <Card className="stats-card border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Top Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <h2 className="text-4xl font-bold">{data.summary?.top_branch?.name || "N/A"}</h2>
              <p className="text-sm text-gray-500">{data.summary?.top_branch?.meals_served || 0} meals</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* People Served By Branch */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>People Served By Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>People Served</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchPerformance.map((branch) => (
                  <TableRow key={branch.name}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.served}</TableCell>
                    <TableCell>{branch.percentage}%</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell>{totalServed}</TableCell>
                  <TableCell>100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Revenue By Branch */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Revenue By Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Paid ticket</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchPerformance.map((branch) => (
                  <TableRow key={branch.name}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.revenueData.subscription.toLocaleString()}</TableCell>
                    <TableCell>{branch.revenueData.paid_ticket.toLocaleString()}</TableCell>
                    <TableCell>{branch.revenueData.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>RWF {branchPerformance.reduce((acc, b) => acc + b.revenueData.total, 0).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white">
           <CardContent className="h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   fill="#8884d8"
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                   <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {totalServed.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                Served
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                 </Pie>
                 <Tooltip content={<CustomTooltip />} />
                 <Legend verticalAlign="middle" align="right" layout="vertical" />
               </PieChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="flex flex-col justify-center h-full space-y-6 p-6">
             {(data.insights || []).map((insight, idx) => (
               <div key={idx} className="flex items-center gap-3">
                  {getInsightIcon(insight)}
                  {/* Simplistic bolding logic: bold words starting with capital letters or numbers, 
                      or just display as is. For strict formatting matching the design, 
                      we might need a parser if the API doesn't return structured text.
                      We will assume the string contains the message. */}
                  <span className="font-medium">{insight}</span>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
