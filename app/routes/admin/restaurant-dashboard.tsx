import { SidebarTrigger } from "~/components/ui/sidebar";
import { Header } from "../../../components/Header";
import StatsCard from "../../../components/StatsCard";
import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "react-router";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function RestaurantDashboard() {
  const navigate = useNavigate();

  // Mock data for the dashboard
  const stats = [
    {
      title: "Current Stock Value(RWF)",
      value: "12,450",
      // Inferring numbers to match the mocked "12%" trend
      currentDay: 12450, 
      lastDayCount: 11116, 
      trendLabel: "vs last month",
    },
    {
      title: "Today's Ingredient(RWF)",
      value: "3,210",
      // Inferring numbers to match mocked "-2%" trend
      currentDay: 3210,
      lastDayCount: 3275,
      trendLabel: "vs last month",
    },
    {
      title: "Revenue Today(RWF)",
      value: "520",
      // Inferring numbers to match mocked "2%" trend
      currentDay: 520,
      lastDayCount: 510,
      trendLabel: "vs last month",
    }
  ];

  const alerts = [
    {
      id: 1,
      item: "Rice",
      quantity: "8kg",
      threshold: "10kg",
      unit: "kg",
      checked: false
    },
    {
      id: 2,
      item: "Cooking Oil",
      quantity: "2L",
      threshold: "10L",
      unit: "L",
      checked: false
    }
  ];

  return (
    <main className="dashboard wrapper flex flex-col gap-6">
      <Header
        title="Management Overview"
        description="Track activity, trends, and popular destinations in real time"
        action={
          <div className="flex items-center gap-2">
            <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
          </div>
        }
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            currentDay={stat.currentDay}
            lastDayCount={stat.lastDayCount}
            trendLabel={stat.trendLabel}
          />
        ))}
      </div>

      {/* Quick Actions Title */}
      <h3 className="text-lg font-bold text-gray-900 mt-2">Quick Actions</h3>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm w-full" onClick={() => navigate("/dairy-usage-report")}>
              Dairy Usage Report
          </Button>
          <Button className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm w-full" onClick={() => navigate("/manage-stock")}>
              Manage Stock
          </Button>
          <Button className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm w-full" onClick={() => navigate("/manage-chefs")}>
              Manage Chefs
          </Button>
          <Button className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm w-full" onClick={() => navigate("/view-profit-report")}>
              View Profit Report
          </Button>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4 mt-2">
        {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-gray-900">
                    <AlertTriangle className="h-5 w-5 text-orange-400 fill-orange-50 stroke-orange-500" />
                    <span className="font-semibold">
                        {alert.item}: {alert.quantity} <span className="font-normal text-gray-500">(below {alert.threshold})</span>
                    </span>
                </div>
                <Button variant="outline" className="bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A] hover:bg-[#FEF08A] font-medium px-6">
                    Refill Stock
                </Button>
            </div>
        ))}
      </div>
    </main>
  );
}
