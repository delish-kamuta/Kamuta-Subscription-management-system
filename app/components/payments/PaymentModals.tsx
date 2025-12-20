import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
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
  selectedItem: Payment | null;
}

export default function PaymentModals({
  viewDetailsOpen,
  setViewDetailsOpen,
  selectedItem,
}: PaymentModalsProps) {

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
    </>
  );
}
