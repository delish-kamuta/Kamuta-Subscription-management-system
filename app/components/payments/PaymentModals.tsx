import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

interface Payment {
  paymentId: string;
  clientName: string;
  branch: string;
  subscriptionType: string;
  amountPaid: number;
  totalMeals: number;
  paymentDate: string;
  addedNotes: string;
  payment: string;
}

interface PaymentModalsProps {
  viewDetailsOpen: boolean;
  setViewDetailsOpen: (open: boolean) => void;
  editOpen: boolean;
  setEditOpen: (open: boolean) => void;
  selectedItem: Payment | null;
  editForm: Payment | null;
  setEditForm: (form: Payment | null) => void;
}

export default function PaymentModals({
  viewDetailsOpen,
  setViewDetailsOpen,
  editOpen,
  setEditOpen,
  selectedItem,
  editForm,
  setEditForm,
}: PaymentModalsProps) {
  const handleSaveEdit = () => {
    // TODO: Implement Redux action to update payment
    console.log("Saving payment:", editForm);
    alert("Payment updated successfully!");
    setEditOpen(false);
  };

  return (
    <>
      {/* View Details Sheet */}
      <Sheet open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white p-6">
          <SheetHeader>
            <SheetTitle>Payment Details</SheetTitle>
            <SheetDescription>View complete payment information</SheetDescription>
          </SheetHeader>
          {selectedItem && (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Payment ID</p>
                <p className="font-medium">{selectedItem.paymentId}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Client Name</p>
                <p className="font-medium">{selectedItem.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Branch</p>
                <p className="font-medium">{selectedItem.branch}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="font-medium text-lg text-green-600">{selectedItem.amountPaid} Rwf</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{selectedItem.payment}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Subscription Type</p>
                <p className="font-medium">{selectedItem.subscriptionType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Meals</p>
                <p className="font-medium">{selectedItem.totalMeals}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Payment Date</p>
                <p className="font-medium">{selectedItem.paymentDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">{selectedItem.addedNotes}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Payment Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white p-6">
          <SheetHeader>
            <SheetTitle>Edit Payment</SheetTitle>
            <SheetDescription>Update payment information</SheetDescription>
          </SheetHeader>
          {editForm && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Client Name</label>
                <Input
                  value={editForm.clientName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, clientName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Branch</label>
                <Input
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subscription Type</label>
                <Input
                  value={editForm.subscriptionType}
                  onChange={(e) =>
                    setEditForm({ ...editForm, subscriptionType: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount Paid</label>
                <Input
                  type="number"
                  value={editForm.amountPaid}
                  onChange={(e) =>
                    setEditForm({ ...editForm, amountPaid: parseFloat(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Meals</label>
                <Input
                  type="number"
                  value={editForm.totalMeals}
                  onChange={(e) =>
                    setEditForm({ ...editForm, totalMeals: parseInt(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <Input
                  value={editForm.payment}
                  onChange={(e) => setEditForm({ ...editForm, payment: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={editForm.addedNotes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, addedNotes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
