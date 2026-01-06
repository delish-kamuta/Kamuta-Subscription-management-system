"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import type { ChartConfig } from "~/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"

export const description = "Remaining Meals Overview"

const chartConfig = {
  client: {
    label: "Clients",
  },
  no_meals: {
    label: "0 meals",
    color: "#2859C5",
  },
  meals_1_5: {
    label: "1-5 meals",
    color: "#3B87E6",
  },
  plenty_meals: {
    label: "Plenty meals",
    color: "#A0C4FC",
  },
} satisfies ChartConfig

export function ChartPieSimple({ data }: { data: { zero: number; low: number; plenty: number } }) {
  const chartData = [
    { meals: "0 Meals", client: data?.zero || 0, fill: "#2859C5" },
    { meals: "1-5 Meals", client: data?.low || 0, fill: "#3B87E6" },
    { meals: "Plenty Meals", client: data?.plenty || 0, fill: "#A0C4FC" },
  ]
  return (
    <Card className="flex flex-col h-[60vh] md:h-[60vh] lg:h-[50vh] gap-2 border-none shadow-400">
      <CardHeader className="items-center pb-0">
    <CardTitle>{description}</CardTitle>
        <CardDescription>Meal Usage Distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-end lg:flex-row pt-0 h-[33vh] md:h-[32vh] lg:h-[33vh]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="client"
              nameKey="meals"
              outerRadius={90}
              innerRadius={40}
              label={false}
            />
          </PieChart>
        </ChartContainer>
        <div className=" flex flex-row lg:flex-col gap-2  justify-between w-full lg:w-[50%] ">
          <div className="flex  items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#2859C5]"></div>
            <p className="font-semibold " >0 meals <span className="text-gray-500 font-normal">({data?.zero || 0})</span></p>
            </div>
            <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#3B87E6]"></div>
            <p className="font-semibold" >1-5 meals <span className="text-gray-500 font-normal">({data?.low || 0})</span></p>
            </div>
            <div className="flex items-center  gap-3">
            <div className="w-3 h-3 rounded-full bg-[#A0C4FC]"></div>
            <p className="font-semibold" >Plenty meals <span className="text-gray-500 font-normal">({data?.plenty || 0})</span></p>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        
      </CardFooter>
    </Card>
  )
}
