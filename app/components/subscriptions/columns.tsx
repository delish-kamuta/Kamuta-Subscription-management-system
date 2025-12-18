import { MoreHorizontal, Eye, Edit, Trash2, QrCode, X, PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "~/store/hooks";
import { generateQrOtpForUser } from "~/services/qr";
import { cancelSubscription, updateSubscription } from "~/store/subscriptionsSlice";
import { fetchBranchesThunk } from "~/store/branchesSlice";
import { UserRole } from "~/types/auth";
function ActionDropdown({ item }: { item: SubscriptionItem }) {
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [editForm, setEditForm] = useState<SubscriptionItem>(item);
  const [topUpForm, setTopUpForm] = useState({ days: 0, mealsToAdd: 0, paymentMethod: 'Cash', amountPaid: 0 });
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const [qrData, setQrData] = useState<{ qr_code: string; user_name: string; expires_in_seconds: number } | null>(null);
  const [qrImage, setQrImage] = useState<string>('');
  const { token, user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;
  const { items: branches } = useAppSelector((s) => (s as any).branches || { items: [] });
  const dispatch = useAppDispatch();

  // Fetch branches if needed
  useEffect(() => {
    if (topUpOpen && branches.length === 0) {
      dispatch(fetchBranchesThunk());
    }
  }, [topUpOpen, branches.length, dispatch]);

  // Auto-calculate meals and amount for Top Up
  useEffect(() => {
    if (topUpOpen && topUpForm.days > 0) {
      // Try to find branch by name or ID
      const branch = branches.find((b: any) => b.name === item.branch || b.id === item.branch);
      
      if (branch) {
        const meals = topUpForm.days * 2;
        let price = 0;
        const type = item.subscriptionType || 'Regular';
        
        // Handle case-insensitive comparison if needed, though usually exact match
        if (type === 'Regular') price = branch.regular_price || 0;
        else if (type === 'VIP') price = branch.vip_price || 0;
        else if (type === 'VVIP') price = branch.vvip_price || 0;
        else price = branch.regular_price || 0; // Fallback

        const amount = meals * price;
        setTopUpForm(prev => ({ ...prev, mealsToAdd: meals, amountPaid: amount }));
      }
    }
  }, [topUpForm.days, item.branch, item.subscriptionType, branches, topUpOpen]);

  // Generate QR-OTP when the sheet opens
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!qrOpen) return;
      try {
        setQrLoading(true); setQrError(''); setQrData(null);
        const uid = (item as any).userId || String(item.id);
        const resp = await generateQrOtpForUser(uid);
        if (!mounted) return;
        if (!resp.success) { setQrError(resp.message || 'Failed to generate QR-OTP'); return; }
        setQrData(resp.data || null);
        // generate QR image
        try {
          const QRCode = (await import('qrcode')).default;
          const url = await QRCode.toDataURL(resp.data?.qr_code || '', { width: 256, margin: 1 });
          setQrImage(url);
        } catch { setQrImage(''); }
      } catch (e) {
        if (!mounted) return;
        setQrError(e instanceof Error ? e.message : 'QR-OTP error');
      } finally {
        if (mounted) setQrLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [qrOpen, item.id]);

  const handleCancel = async () => {
    if (confirm(`Are you sure you want to cancel subscription for ${item.clientName}?`)) {
      if (!item.subscriptionId) {
        alert("Cannot cancel: Missing subscription ID");
        return;
      }
      try {
        await dispatch(cancelSubscription({ token, id: item.subscriptionId })).unwrap();
        alert(`Subscription for ${item.clientName} has been cancelled`);
      } catch (e) {
        alert(`Failed to cancel: ${e}`);
      }
    }
  };

  const handleEditSave = () => {
    // TODO: Dispatch Redux action to update subscription
    console.log('Updating subscription:', editForm);
    alert(`Subscription for ${editForm.clientName} has been updated`);
    // Example: dispatch(updateSubscription(editForm));
    setEditOpen(false);
  };
const handleTopUpSave = async () => {
    if (!item.subscriptionId) {
      alert("Cannot top up: Missing subscription ID");
      return;
    }
    try {
      await dispatch(updateSubscription({
        token,
        id: item.subscriptionId,
        payload: {
          total_meals: topUpForm.days * 2,
          payment: {
            amount: topUpForm.amountPaid,
            payment_method: topUpForm.paymentMethod.toLowerCase()
          }
        }
      })).unwrap();
      alert(`Top up successful for ${item.clientName}`);
      setTopUpOpen(false);
      setTopUpForm({ days: 0, mealsToAdd: 0, paymentMethod: 'Cash', amountPaid: 0 });
    } catch (e) {
      alert(`Failed to top up: ${e}`);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border-black/20">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setViewDetailsOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setQrOpen(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            Generate QR Code
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTopUpOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Top Up
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuItem onClick={() => { setEditForm(item); setEditOpen(true); }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCancel} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel Subscription
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-base font-mono">{item.tel || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Subscription Type</label>
                <p className="text-base">{item.subscriptionType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date Started</label>
                <p className="text-base">
                  {item.dateStarted ? new Date(item.dateStarted).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Branch</label>
                <p className="text-base">
                  {branches.find((b: any) => b.id === item.branch)?.name || item.branch || 'N/A'}
                </p>
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
      <Sheet open={editOpen} onOpenChange={setEditOpen} >
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
              <label className="text-sm font-medium">Branch</label>
              <select
                value={editForm.branch}
                onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {Array.isArray(branches) && branches.length > 0 ? (
                  branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))
                ) : (
                  <option value="">Select branch</option>
                )}
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

      {/* Top Up Sheet */}
      <Sheet open={topUpOpen} onOpenChange={setTopUpOpen}>
        <SheetContent className="overflow-y-auto bg-white p-6">
          <SheetHeader>
            <SheetTitle>Top Up Subscription</SheetTitle>
            <SheetDescription>Add meals and record payment for {item.clientName}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Days</label>
              <Input
                type="number"
                min={1}
                value={topUpForm.days}
                onChange={(e) => setTopUpForm({ ...topUpForm, days: parseInt(e.target.value) || 0 })}
                placeholder="Enter number of days"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Amount to Pay (Auto-calculated) *</label>
              <Input
                type="number"
                min={0}
                value={topUpForm.amountPaid}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <select
                value={topUpForm.paymentMethod}
                onChange={(e) => setTopUpForm({ ...topUpForm, paymentMethod: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value='cash'>Cash</option>
                <option value='momo'>Mobile Money</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleTopUpSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Confirm Top Up</Button>
              <Button onClick={() => setTopUpOpen(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Generate QR Sheet */}
      <Sheet open={qrOpen} onOpenChange={setQrOpen}>
        <SheetContent className="overflow-y-auto bg-white p-6">
          <SheetHeader>
            <SheetTitle>QR-OTP</SheetTitle>
            <SheetDescription>Temporary QR for {item.clientName}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Client Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Registration Number:</span>
                <span className="text-sm font-mono font-medium">{item.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Client Name:</span>
                <span className="text-sm font-medium">{item.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Meals Left:</span>
                <span className="text-sm font-semibold text-green-600">{item.mealsLeft}</span>
              </div>
            </div>

            {/* QR-OTP Details */}
            {qrLoading && (
              <div className="w-full bg-gray-100 animate-pulse rounded-lg p-6 text-center text-gray-500">Generating QR-OTP…</div>
            )}
            {qrError && (
              <div className="w-full rounded-lg p-3 bg-red-50 text-red-700 text-sm">{qrError}</div>
            )}
            {qrData && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-between bg-white border rounded p-4">
                  <div>
                    <p className="text-sm"><span className="text-gray-500">User:</span> {qrData.user_name}</p>
                    <p className="text-sm"><span className="text-gray-500">Expires:</span> {qrData.expires_in_seconds}s</p>
                  </div>
                  {qrImage ? (
                    <img src={qrImage} alt="QR-OTP" className="w-40 h-40" />
                  ) : (
                    <div className="font-mono text-xs break-all p-2 bg-gray-50 border rounded">
                      {qrData.qr_code}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Use this code to generate a scannable QR or print it. It expires automatically.</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  try {
                    setQrLoading(true); setQrError('');
                    const uid = (item as any).userId || String(item.id);
                    const resp = await generateQrOtpForUser(uid);
                    if (!resp.success) { setQrError(resp.message || 'Failed to generate QR-OTP'); return }
                    setQrData(resp.data || null)
                    try {
                      const QRCode = (await import('qrcode')).default;
                      const url = await QRCode.toDataURL(resp.data?.qr_code || '', { width: 256, margin: 1 });
                      setQrImage(url);
                    } catch { setQrImage(''); }
                  } catch (e) {
                    setQrError(e instanceof Error ? e.message : 'QR-OTP error')
                  } finally {
                    setQrLoading(false)
                  }
                }}
                variant="outline"
                className="flex-1"
              >
                Regenerate
              </Button>
              <Button 
                onClick={() => setQrOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
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

export function getSubscriptionColumns(isCashier: boolean, resolveBranchName?: (v: string | undefined) => string): SubscriptionColumn[] {
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
      key: "dateStarted",
      header: "Date Started",
      headerClassName: "hidden md:table-cell whitespace-nowrap",
      cellClassName: "hidden md:table-cell text-sm",
      render: (item) => {
        const d = item.dateStarted ? new Date(item.dateStarted) : null;
        const formatted = d
          ? d.toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';
        return formatted || item.dateStarted;
      },
    },
    {
      key: "branch",
      header: "Branch",
      headerClassName: "hidden xl:table-cell whitespace-nowrap",
      cellClassName: "hidden xl:table-cell text-sm",
      hideForCashier: true,
      render: (item) => {
        const val = item.branch;
        return (resolveBranchName ? resolveBranchName(val) : val) || '';
      },
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
      // Visible for both Admin and Cashier
      hideForCashier: false,
      render: (item) => <ActionDropdown item={item} />,
    },
  ];

  return cols.filter((c) => !(isCashier && c.hideForCashier));
}
