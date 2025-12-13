import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "~/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import React from "react";
import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "~/lib/utils";
import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";
import { useNavigate } from "react-router-dom";

interface WorkerSubscriptionTableProps {
  items: SubscriptionItem[];
}

export default function WorkerSubscriptionTable({ items }: WorkerSubscriptionTableProps) {
  const navigate = useNavigate();
  const [qrOpenId, setQrOpenId] = React.useState<string | null>(null);
  const [qrLoading, setQrLoading] = React.useState(false);
  const [qrError, setQrError] = React.useState('');
  const [qrData, setQrData] = React.useState<{ qr_code: string; user_name: string; expires_in_seconds: number } | null>(null);
  const [qrImage, setQrImage] = React.useState<string>('');
  return (
    <div className="overflow-x-auto text-gray-500">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Phone</TableHead>
            <TableHead className="whitespace-nowrap">Name</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Branch</TableHead>
            <TableHead className="whitespace-nowrap">Wallet Balance</TableHead>
            <TableHead className="whitespace-nowrap">Meals (This Month)</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Last Meal</TableHead>
            <TableHead className="hidden md:table-cell whitespace-nowrap">Last Top-up</TableHead>
            <TableHead className="whitespace-nowrap">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const lastMeal = (item as any).lastMeal as string | undefined;
            const lastTopUp = (item as any).lastTopUp as string | undefined;
            const lastMealFmt = lastMeal
              ? new Date(lastMeal).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : "";
            const lastTopUpFmt = lastTopUp
              ? new Date(lastTopUp).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : "";
            const prepaid = Number((item as any).prepaidBalance ?? 0);
            const credit = Number((item as any).creditBalance ?? 0);
            const baseWallet = Number((item as any).walletBalance ?? 0);
            const wallet = Number.isFinite(baseWallet) && baseWallet !== 0
              ? baseWallet
              : (prepaid - credit);
            const mealsThisMonth = Number((item as any).mealsThisMonth ?? 0);

            return (
              <TableRow key={`${item.tel}-${item.subscriptionType || ''}`}>
                <TableCell className="font-mono text-xs">{item.tel}</TableCell>
                <TableCell className="font-medium text-black">{item.clientName}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{item.branch}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(wallet)}</TableCell>
                <TableCell className="font-semibold">{mealsThisMonth}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{lastMealFmt}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{lastTopUpFmt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white border border-black/10">
                      <DropdownMenuItem onClick={() => navigate(`/wallet?userId=${encodeURIComponent(String(item.id))}`)}>
                        Open Wallet
                      </DropdownMenuItem>
                        <DropdownMenuItem onClick={async () => {
                          try {
                            setQrOpenId(String(item.id));
                            setQrLoading(true); setQrError(''); setQrData(null);
                            const { generateQrOtpForUser } = await import('~/services/qr');
                            const uid = (item as any).userId || String(item.id);
                            const resp = await generateQrOtpForUser(uid);
                            if (!resp.success) { setQrError(resp.message || 'Failed to generate QR-OTP'); return }
                            setQrData(resp.data || null);
                            try {
                              const QRCode = (await import('qrcode')).default;
                              const url = await QRCode.toDataURL(resp.data?.qr_code || '', { width: 256, margin: 1 });
                              setQrImage(url);
                            } catch { setQrImage(''); }
                          } catch (e) {
                            setQrError(e instanceof Error ? e.message : 'QR-OTP error');
                          } finally {
                            setQrLoading(false);
                          }
                        }}>
                          Generate QR Code
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
        {items.map((item) => (
          <Sheet key={`qr-${item.id}`} open={qrOpenId === String(item.id)} onOpenChange={(o) => !o && setQrOpenId(null)}>
            <SheetContent className="overflow-y-auto bg-white p-6">
              <SheetHeader>
                <SheetTitle>QR-OTP</SheetTitle>
                <SheetDescription>Temporary QR for {item.clientName}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Registration Number:</span>
                    <span className="text-sm font-mono font-medium">{item.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Client Name:</span>
                    <span className="text-sm font-medium">{item.clientName}</span>
                  </div>
                </div>
                {qrLoading && (
                  <div className="w-full bg-gray-100 animate-pulse rounded-lg p-6 text-center text-gray-500">Generating QR-OTP…</div>
                )}
                {qrError && (
                  <div className="w-full rounded-lg p-3 bg-red-50 text-red-700 text-sm">{qrError}</div>
                )}
                {qrData && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white border rounded p-4">
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
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={async () => {
                      try {
                        setQrLoading(true); setQrError('');
                        const { generateQrOtpForUser } = await import('~/services/qr');
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
                  <Button onClick={() => setQrOpenId(null)} className="flex-1">Close</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ))}
    </div>
  );
}