import { MoreHorizontal, Eye, Edit, Trash2, QrCode, X, PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
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
import { cancelSubscription, updateSubscription, updateStudentDetails, fetchSubscriptions } from "~/store/subscriptionsSlice";
import { fetchBranchesThunk } from "~/store/branchesSlice";
import { UserRole } from "~/types/auth";
import { handleGenerateQr, printQrTicket, sendToMobilePrinter } from "~/lib/qr-utils";
import dayjs from "dayjs";

function ActionDropdown({ item }: { item: SubscriptionItem }) {
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [editForm, setEditForm] = useState<SubscriptionItem & { mealsLeftEdit?: number }>({ ...item, mealsLeftEdit: item.mealsLeft });
  const [topUpForm, setTopUpForm] = useState({ days: 0, mealsToAdd: 0, paymentMethod: 'Cash', amountPaid: 0 });
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // QR State
  const [qrState, setQrState] = useState<{
    loading: boolean;
    error: string;
    data: { qr_code: string; user_name: string; expires_in_seconds: number } | null;
    image: string;
  }>({ loading: false, error: '', data: null, image: '' });

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
        const isWorker = item.customerType?.toLowerCase() === 'worker';
        
        if (isWorker) {
          if (type === 'Regular') price = branch.worker_regular_price || 0;
          else if (type === 'VIP') price = branch.worker_vip_price || 0;
          else if (type === 'VVIP') price = branch.worker_vvip_price || 0;
          else price = branch.worker_regular_price || 0;
        } else {
          // Default to student
          if (type === 'Regular') price = branch.student_regular_price || 0;
          else if (type === 'VIP') price = branch.student_vip_price || 0;
          else if (type === 'VVIP') price = branch.student_vvip_price || 0;
          else price = branch.student_regular_price || 0;
        }

        const amount = meals * price;
        setTopUpForm(prev => ({ ...prev, mealsToAdd: meals, amountPaid: amount }));
      }
    }
  }, [topUpForm.days, item.branch, item.subscriptionType, item.customerType, branches, topUpOpen]);

  // Generate QR-OTP when the sheet opens
  useEffect(() => {
    if (qrOpen) {
      const uid = (item as any).userId || String(item.id);
      handleGenerateQr(uid, (newState) => setQrState(prev => ({ ...prev, ...newState })));
    }
  }, [qrOpen, item.id, item]);

  const handlePrint = () => {
    printQrTicket(`ticket-content-${item.id}`);
  };

  const handleCancel = async () => {
    if (confirm(`⚠️ WARNING: You are about to cancel the subscription for ${item.clientName}.\n\nThis action is irreversible. Are you sure you want to proceed?`)) {
      if (!item.subscriptionId) {
        alert("Cannot cancel: Missing subscription ID");
        return;
      }
      try {
        await dispatch(cancelSubscription({ token, id: item.subscriptionId })).unwrap();
        alert(`✅ SUCCESS: Subscription for ${item.clientName} has been cancelled.`);
      } catch (e) {
        alert(`❌ Failed to cancel: ${e}`);
      }
    }
  };

  const handleEditSave = async () => {
    if (editLoading) return;
    const studentId = item.studentId;
    if (!studentId) {
      console.warn("Missing studentId on item", item);
      alert("Cannot update: Missing Student ID details");
      return;
    }
    
    setEditLoading(true);
    try {
      await dispatch(updateStudentDetails({
        token,
        id: studentId,
        payload: {
          full_name: editForm.clientName,
          phone: editForm.tel,
          reg_number: editForm.id,
          status: editForm.status || 'active',
          student_type: editForm.studentType || 'regular',
          branch_id: editForm.branch
        }
      })).unwrap();

      // If meals left or meal type was changed, update the subscription too
      const subscriptionPayload: Record<string, unknown> = {};
      const newMeals = editForm.mealsLeftEdit ?? item.mealsLeft;
      if (newMeals !== item.mealsLeft) subscriptionPayload.remaining_meals = newMeals;
      if (editForm.subscriptionType && editForm.subscriptionType !== item.subscriptionType) {
        subscriptionPayload.meal_type = editForm.subscriptionType;
      }
      if (Object.keys(subscriptionPayload).length > 0 && item.subscriptionId) {
        await dispatch(updateSubscription({
          token,
          id: item.subscriptionId,
          payload: subscriptionPayload
        })).unwrap();
      }

      alert(`Student details for ${editForm.clientName} have been updated`);
      setEditOpen(false);
      // Refresh list to show changes
      dispatch(fetchSubscriptions({ token }));
    } catch (e) {
      alert(`Failed to update: ${e}`);
    } finally {
      setEditLoading(false);
    }
  };
const handleTopUpSave = async () => {
    if (topUpLoading) return;
    if (!item.subscriptionId) {
      alert("Cannot top up: Missing subscription ID");
      return;
    }
    setTopUpLoading(true);
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
    } finally {
      setTopUpLoading(false);
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
              <DropdownMenuItem onClick={() => { setEditForm({ ...item, mealsLeftEdit: item.mealsLeft }); setEditOpen(true); }}>
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
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={editForm.clientName}
                onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Registration Number</label>
              <Input
                value={editForm.id}
                onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={editForm.tel || ''}
                onChange={(e) => setEditForm({ ...editForm, tel: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Meal Type</label>
              <select
                value={editForm.subscriptionType || 'Regular'}
                onChange={(e) => setEditForm({ ...editForm, subscriptionType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="VVIP">VVIP</option>
                <option value="VIP">VIP</option>
                <option value="Regular">Regular</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Student Type</label>
              <select
                value={editForm.studentType || 'regular'}
                onChange={(e) => setEditForm({ ...editForm, studentType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="regular">Regular Student</option>
                <option value="leader">Student Leader</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={editForm.status || 'active'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Meals Left</label>
              <Input
                type="number"
                min={0}
                value={editForm.mealsLeftEdit ?? editForm.mealsLeft}
                onChange={(e) => setEditForm({ ...editForm, mealsLeftEdit: parseInt(e.target.value) || 0 })}
              />
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
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditSave} disabled={editLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">{editLoading ? 'Saving...' : 'Save Changes'}</Button>
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
              <Button onClick={handleTopUpSave} disabled={topUpLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">{topUpLoading ? 'Processing...' : 'Confirm Top Up'}</Button>
              <Button onClick={() => setTopUpOpen(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Generate QR Sheet */}
      <Sheet open={qrOpen} onOpenChange={setQrOpen}>
        <SheetContent className="flex flex-col h-full p-0 bg-white">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>QR-OTP</SheetTitle>
            <SheetDescription>Temporary QR for {item.clientName}</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

            {/* QR Content */}
            {qrState.loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            {qrState.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {qrState.error}
              </div>
            )}
            {qrState.data && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div id={`ticket-content-${item.id}`} className="ticket">
                  <div className="text-center font-semibold tracking-wide">MEAL TICKET</div>
                  <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                    <div><span className="font-semibold">Name:</span> {qrState.data.user_name}</div>
                    <div><span className="font-semibold">Reg #:</span> {item.id}</div>
                    <div><span className="font-semibold">Type:</span> {item.subscriptionType}</div>
                    <div><span className="font-semibold">Meals:</span> {item.mealsLeft}</div>
                    <div><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
                    <div><span className="font-semibold">Time:</span> {new Date().toLocaleTimeString()}</div>
                  </div>
                  
                  <div className="my-3 border-t border-dashed border-gray-400"></div>
                  
                  <div className="qr flex justify-center items-center">
                    {qrState.image ? (
                      <img src={qrState.image} alt="QR Code" className="w-48 h-48" />
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                        Generating QR...
                      </div>
                    )}
                  </div>
                  
                  <div className="my-3 border-t border-dashed border-gray-400"></div>
                  <div className="text-center text-xs text-gray-500">
                    Scan at point of service<br/>
                    Valid for {Math.floor(qrState.data.expires_in_seconds / 60)} minutes
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {qrState.data && (
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-100">
                <p className="font-medium text-blue-800 mb-1">Instructions:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>This QR code is temporary and expires in {Math.floor(qrState.data.expires_in_seconds / 60)} minutes.</li>
                  <li>Print this ticket or show it on screen to the scanner.</li>
                  <li>Once scanned, one meal will be deducted from the subscription.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <SheetFooter className="p-6 border-t bg-gray-50">
            <div className="flex gap-2 w-full">
              <Button 
                onClick={() => {
                  const uid = (item as any).userId || String(item.id);
                  handleGenerateQr(uid, (newState) => setQrState(prev => ({ ...prev, ...newState })));
                }}
                variant="outline"
                className="flex-1"
              >
                Regenerate
              </Button>
              <Button
                disabled={!qrState.image}
                onClick={() => {
                  const isAndroid = /Android/i.test(navigator.userAgent);
                  if (isAndroid && qrState.data) {
                    const expireDate = dayjs().add(qrState.data.expires_in_seconds, 'second');
                    
                    let price = 0;
                    const branch = branches.find((b: any) => b.name === item.branch || b.id === item.branch);
                    if (branch) {
                        const type = item.subscriptionType || 'Regular';
                        const isWorker = item.customerType?.toLowerCase() === 'worker';
                        
                        if (isWorker) {
                             if (type === 'Regular') price = branch.worker_regular_price || 0;
                             else if (type === 'VIP') price = branch.worker_vip_price || 0;
                             else if (type === 'VVIP') price = branch.worker_vvip_price || 0;
                             else price = branch.worker_regular_price || 0;
                        } else {
                             if (type === 'Regular') price = branch.student_regular_price || 0;
                             else if (type === 'VIP') price = branch.student_vip_price || 0;
                             else if (type === 'VVIP') price = branch.student_vvip_price || 0;
                             else price = branch.student_regular_price || 0;
                        }
                    }

                    sendToMobilePrinter({
                      items: [{ name: `Subscription Meal (${item.subscriptionType})`, qty: 1, price: price }],
                      total: price,
                      qrCode: qrState.data.qr_code,
                      ticketId: item.subscriptionId || item.id,
                      date: dayjs().format('D MMM YYYY, HH:mm'),
                      expiresAt: expireDate.format('D MMM YYYY, HH:mm'),
                      payerType: item.customerType || 'Student',
                      mealType: item.subscriptionType,
                      paymentMethod: 'Subscription',
                      payerName: qrState.data.user_name
                    });
                  } else {
                    printQrTicket(`ticket-content-${item.id}`);
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Print QR
              </Button>
              <Button 
                onClick={() => setQrOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </SheetFooter>
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
      key: "status",
      header: "Status",
      render: (item) => {
        let status = item.status?.toLowerCase() || '';
        
        if (item.mealsLeft === 0) {
           status = 'expired';
        } else if (status === 'expired') {
           status = 'cancelled';
        } else if (!status) {
           status = 'active';
        }
        
        let colorClass = "bg-gray-100 text-gray-800";
        if (status === 'active') colorClass = "bg-green-100 text-green-800";
        else if (status === 'expired') colorClass = "bg-red-100 text-red-800";
        else if (status === 'cancelled') colorClass = "bg-yellow-100 text-yellow-800";

        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap capitalize ${colorClass}`}
          >
            {status}
          </span>
        );
      },
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
