"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"
import type { MonthlyData } from "~/services/overview"

export const description = "A stacked bar chart"

const chartConfig = {
  total_meals: {
    label: "Used Meals",
    color: "#256FF1",
  },
  remaining_meals: {
    label: "Remaining Meals",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export function ChartBarMultiple({ data }: { data: MonthlyData[] }) {
  // Format info if data is empty to prevent errors or show empty state
  const displayData = data && data.length > 0 ? data : []; 

  return (
    <Card className="md:h-[60vh] lg:h-[50vh] gap-7 border-none bg-white shadow-400">
      <CardHeader>
        <CardTitle>Subscriptions</CardTitle>
        <CardDescription>Monthly Meal Usage</CardDescription>
      </CardHeader>
      <CardContent className="md:h-[29vh] ">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={displayData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                 const date = new Date(value);
                 return isNaN(date.getTime()) ? value : date.toLocaleString('default', { month: 'short' });
              }}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Bar dataKey="total_meals" stackId="a" fill="var(--color-total_meals)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="remaining_meals" stackId="a" fill="var(--color-remaining_meals)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
