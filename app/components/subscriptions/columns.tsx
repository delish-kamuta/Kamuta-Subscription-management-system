import { MoreHorizontal, Eye, Edit, Trash2, QrCode, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";
import React, { useState } from "react";

function ActionDropdown({ item }: { item: SubscriptionItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<SubscriptionItem>(item);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete subscription for ${item.clientName}?`)) {
      // TODO: Dispatch Redux action to delete subscription
      console.log('Deleting subscription:', item.id);
      alert(`Subscription for ${item.clientName} has been deleted`);
      // Example: dispatch(deleteSubscription(item.id));
    }
  };

  const handleEditSave = () => {
    // TODO: Dispatch Redux action to update subscription
    console.log('Updating subscription:', editForm);
    alert(`Subscription for ${editForm.clientName} has been updated`);
    // Example: dispatch(updateSubscription(editForm));
    setEditOpen(false);
  };

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
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black/10 ring-opacity-5">
            <div className="py-1" role="menu">
              <button
                onClick={() => {
                  setViewDetailsOpen(true);
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
                  setEditForm(item);
                  setEditOpen(true);
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
                  setIsOpen(false);
                  handleDelete();
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
      {/* View Details Sheet */}
      <Sheet open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <SheetContent className="overflow-y-auto bg-white p-6">
          <SheetHeader>
            <SheetTitle>Subscription Details</SheetTitle>
            <SheetDescription>Complete information about this subscription</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Registration Number</label>
                <p className="text-base font-mono">{item.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Client Name</label>
                <p className="text-base font-medium">{item.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Subscription Type</label>
                <p className="text-base">{item.subscriptionType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Customer Type</label>
                <p className="text-base">{item.customerType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date Started</label>
                <p className="text-base">{item.dateStarted}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Branch</label>
                <p className="text-base">{item.branch}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Meals</label>
                <p className="text-base font-semibold">{item.totalMeals}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Meals Left</label>
                <p className="text-base font-semibold text-green-600">{item.mealsLeft}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Method</label>
                <p className="text-base">{item.payment}</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="overflow-y-auto bg-white p-6">
          <SheetHeader>
            <SheetTitle>Edit Subscription</SheetTitle>
            <SheetDescription>Update subscription information</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Client Name</label>
              <Input
                value={editForm.clientName}
                onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
              />
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
            <div>
              <label className="text-sm font-medium">Customer Type</label>
              <select
                value={editForm.customerType}
                onChange={(e) => setEditForm({ ...editForm, customerType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option>Student</option>
                <option>Staff</option>
                <option>Guest</option>
              </select>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Total Meals</label>
                <Input
                  type="number"
                  value={editForm.totalMeals}
                  onChange={(e) => setEditForm({ ...editForm, totalMeals: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Meals Left</label>
                <Input
                  type="number"
                  value={editForm.mealsLeft}
                  onChange={(e) => setEditForm({ ...editForm, mealsLeft: parseInt(e.target.value) })}
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
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditSave} className="flex-1">Save Changes</Button>
              <Button onClick={() => setEditOpen(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
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
