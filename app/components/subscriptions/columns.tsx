import { MoreHorizontal, Eye, Edit, Trash2, QrCode } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";
import React, { useState } from "react";

function ActionDropdown({ item }: { item: SubscriptionItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              <button
                onClick={() => {
                  alert(`View details for ${item.clientName}`);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <Eye className="mr-3 h-4 w-4" />
                View Details
              </button>

              <button
                onClick={() => {
                  alert(`Generate QR for ${item.clientName}`);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <QrCode className="mr-3 h-4 w-4" />
                Generate QR
              </button>

              <button
                onClick={() => {
                  alert(`Edit subscription for ${item.clientName}`);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <Edit className="mr-3 h-4 w-4" />
                Edit
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete subscription for ${item.clientName}?`)) {
                    alert(`Deleted ${item.clientName}`);
                  }
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                role="menuitem"
              >
                <Trash2 className="mr-3 h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export interface SubscriptionColumn {
  key: keyof SubscriptionItem | "action";
  header: string;
  headerClassName?: string; // Tailwind classes for header cell
  cellClassName?: string;   // Tailwind classes for body cell
  hideForCashier?: boolean; // Column removed entirely for cashier
  render?: (item: SubscriptionItem) => React.ReactNode;
}

export function getSubscriptionColumns(isCashier: boolean): SubscriptionColumn[] {
  const cols: SubscriptionColumn[] = [
    {
      key: "id",
      header: "Reg Number",
      cellClassName: "font-mono text-xs",
    },
    {
      key: "clientName",
      header: "Client ID",
      cellClassName: "font-medium text-black",
    },
    {
      key: "subscriptionType",
      header: "Subscription Type",
      headerClassName: "hidden lg:table-cell whitespace-nowrap",
      cellClassName: "hidden lg:table-cell",
    },
    {
      key: "customerType",
      header: "Customer Type",
      headerClassName: "hidden md:table-cell whitespace-nowrap",
      cellClassName: "hidden md:table-cell",
    },
    {
      key: "dateStarted",
      header: "Date Started",
      headerClassName: "hidden md:table-cell whitespace-nowrap",
      cellClassName: "hidden md:table-cell text-sm",
    },
    {
      key: "branch",
      header: "Branch",
      headerClassName: "hidden xl:table-cell whitespace-nowrap",
      cellClassName: "hidden xl:table-cell text-sm",
      hideForCashier: true,
    },
    {
      key: "totalMeals",
      header: "Total Meals",
      cellClassName: "font-semibold",
    },
    {
      key: "mealsLeft",
      header: "Meals Left",
      cellClassName: "font-semibold",
    },
    {
      key: "payment",
      header: "Payment",
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
            item.payment === "Cash"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {item.payment}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      hideForCashier: true,
      render: (item) => <ActionDropdown item={item} />,
    },
  ];

  return cols.filter((c) => !(isCashier && c.hideForCashier));
}
