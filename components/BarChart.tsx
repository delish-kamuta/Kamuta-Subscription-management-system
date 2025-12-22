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

export const description = "A stacked bar chart"

const chartData = [
  { month: "January", Subscription: 186, mobile: 80 },
  { month: "February", Subscription: 305, mobile: 200 },
  { month: "March", Subscription: 237, mobile: 120 },
  { month: "April", Subscription: 73, mobile: 190 },
  { month: "May", Subscription: 209, mobile: 130 },
  { month: "June", Subscription: 214, mobile: 140 },
]

const chartConfig = {
  Subscription: {
    label: "Subscription",
    color: "#256FF1",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export function ChartBarMultiple() {
  return (
    <Card className="md:h-[60vh] lg:h-[50vh] gap-7 border-none bg-white shadow-400">
      <CardHeader>
        <CardTitle>Subscriptions</CardTitle>
        <CardDescription>January - June 2025</CardDescription>
      </CardHeader>
      <CardContent className="md:h-[29vh] ">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Bar dataKey="Subscription" stackId="a" fill="var(--color-Subscription)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="mobile" stackId="a" fill="var(--color-mobile)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
