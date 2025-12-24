import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Camera, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAppSelector } from "~/store/hooks";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { scanQrOtp } from "~/services/qr";
import { scanIrregularTicket } from "~/services/irregularTickets";

interface ScanResult {
  success: boolean;
  message: string;
  timestamp?: string;
  userName?: string;
  remainingMeals?: number;
  mealType?: string;
}

const ScanQR = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = "qr-reader";

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const processQRData = async (decodedText: string) => {
    if (processing) return;
    setProcessing(true);
    try {
      const qrCode = decodedText.trim();
      
      if (!qrCode) {
        setScanResult({ success: false, message: "QR code is empty", timestamp: new Date().toLocaleString() });
        setScanError('QR code cannot be empty');
        return;
      }

      // Try irregular ticket scan first
      const ir = await scanIrregularTicket(qrCode);
      if (ir.success) {
        setScanResult({
          success: true,
          message: `Walk-in ticket processed for ${ir.data?.payer_name || 'Walk-in'}`,
          timestamp: new Date().toLocaleString(),
          userName: ir.data?.payer_name,
          remainingMeals: undefined,
        });
        setScanError(null);
        setRecentScans(prev => [{
          success: true,
          message: 'Walk-in ticket processed',
          timestamp: new Date().toLocaleString(),
          userName: ir.data?.payer_name,
          remainingMeals: undefined,
        }, ...prev.slice(0, 4)]);
        return;
      }

      // Fallback: subscription QR-OTP scan
      const res = await scanQrOtp(qrCode);
      setScanResult({
        success: res.success,
        message: res.success 
          ? `Meal payment processed for ${res.data?.user_name}` 
          : (res.message || "QR scan failed"),
        timestamp: new Date().toLocaleString(),
        userName: res.data?.user_name,
        remainingMeals: res.data?.payment_result?.remaining_meals,
        mealType: res.data?.payment_result?.meal_type,
      });
      setRecentScans(prev => [{
        success: res.success,
        message: res.success ? "Payment processed" : "Payment failed",
        timestamp: new Date().toLocaleString(),
        userName: res.data?.user_name,
        remainingMeals: res.data?.payment_result?.remaining_meals,
        mealType: res.data?.payment_result?.meal_type,
      }, ...prev.slice(0, 4)]);
      setScanError(res.success ? null : (res.message || 'Failed to process QR-OTP'));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setScanError(`Processing error: ${msg}`);
      setScanResult({ success: false, message: "Invalid QR code", timestamp: new Date().toLocaleString() });
    } finally {
      setProcessing(false);
    }
  };

  const handleStartScan = async () => {
    try {
      setScanResult(null);
      setIsScanning(true);

      // Wait for the DOM element to be rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      const html5QrCode = new Html5Qrcode(scannerElementId);
      scannerRef.current = html5QrCode;

      const config = { 
        fps: 15,
        qrbox: { width: 320, height: 320 },
        aspectRatio: 1.0,
        // Restrict decoder to QR codes only for reliability
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        // Try to improve low-light scans if device supports torch
        // experimental options are ignored silently if unsupported
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        }
      } as any;

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        (decodedText) => {
          // QR Code detected
          processQRData(decodedText);
          // Stop scanning after successful scan
          handleStopScan();
        },
        (errorMessage) => {
          // Ignore standard scanning errors (no QR found in frame)
          // Only report critical errors if needed
          const msg = String(errorMessage);
          if (!msg.includes("NotFoundException") && !msg.includes("No MultiFormat Readers")) {
             console.warn("QR Scan Error:", msg);
          }
        }
      );

      setHasPermission(true);
    } catch (error) {
      console.error("Error starting scanner:", error);
      setHasPermission(false);
      setIsScanning(false);
      setScanResult({
        success: false,
        message: "Camera access denied or unavailable. Please allow camera permission.",
        timestamp: new Date().toLocaleString()
      });
    }
  };

  const handleStopScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setIsScanning(false);
  };

  const handleCancelScan = () => {
    handleStopScan();
    setScanResult(null);
  };

  return (
    <main className="dashboard wrapper">
      <Header
        title="Scan QR Code"
        description="Scan student QR codes to verify meal subscriptions"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Scanner Section */}
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 " />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Position the QR code within the frame to scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Scanner Display */}
              <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                {isScanning ? (
                  <>
                    <div id={scannerElementId} className="w-full h-full"></div>
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white/30 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                      </div>
                      <p className="mt-4 text-white/80 text-sm font-medium animate-pulse">Scanning...</p>
                    </div>
                    <style>{`
                      @keyframes scan {
                        0% { top: 0; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                      }
                    `}</style>
                  </>
                ) : (
                  <div className="text-center text-gray-400 space-y-3">
                    {processing ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary-100 mb-4" />
                        <p className="text-lg font-medium text-gray-700">Verifying ticket...</p>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-16 h-16 mx-auto opacity-50" />
                        <p>Camera ready to scan</p>
                        <p className="text-xs">Press the button below to start scanning</p>
                        {hasPermission === false && (
                          <p className="text-xs text-red-400">
                            Camera permission denied. Please enable camera access.
                          </p>
                        )}
                        {scanError && (
                          <p className="text-xs text-red-500 break-all">{scanError}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
                            {/* Action Buttons */}
              <div className="flex gap-3">
                {isScanning ? (
                  <Button
                    onClick={handleCancelScan}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel Scan
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartScan}
                    className="w-full bg-primary-100 hover:bg-primary-100/90"
                  >
                    <Camera className="w-4 h-4 mr-2 text-white" />
                    <p className="text-white">Start Scanning</p>
                  </Button>
                )}
              </div>
              {/* Scan Result */}
              {scanResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  scanResult.success 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-start gap-3">
                    {scanResult.success ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        scanResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {scanResult.message}
                      </h3>
                      {scanResult.success && (
                        <div className="mt-2 space-y-1 text-sm text-green-800">
                          {scanResult.userName && (
                            <p><strong>User:</strong> {scanResult.userName}</p>
                          )}
                          {scanResult.remainingMeals !== undefined && (
                            <p><strong>Remaining Meals:</strong> {scanResult.remainingMeals}</p>
                          )}
                          {scanResult.mealType && (
                            <p><strong>Meal Type:</strong> {scanResult.mealType}</p>
                          )}
                          <p className="text-xs text-green-600 mt-2">
                            {scanResult.timestamp}
                          </p>
                        </div>
                      )}
                      {!scanResult.success && (
                        <div className="mt-2 space-y-1 text-sm text-red-800">
                          {scanError && (
                            <p><strong>Error:</strong> {scanError}</p>
                          )}
                          <p className="text-xs text-red-600 mt-2">
                            {scanResult.timestamp}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {!scanResult && scanError && (
                <div className="p-3 rounded-md border border-red-300 bg-red-50 text-red-700 text-xs">
                  {scanError}
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Recent Scans Section */}
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>
              Latest verified meal scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No scans yet</p>
                <p className="text-sm">Start scanning to see results here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {scan.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-medium text-sm">
                            {scan.userName || 'Unknown User'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {scan.remainingMeals !== undefined && (
                            <p>Remaining: {scan.remainingMeals} meals</p>
                          )}
                          {scan.mealType && (
                            <p>Type: {scan.mealType}</p>
                          )}
                          <p className="text-gray-400">{scan.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6 border-black/10">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-primary-100 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Start Scanner</h4>
                <p className="text-sm text-gray-600">
                  Click the "Start Scanning" button to activate the camera
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-primary-100 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Position QR Code</h4>
                <p className="text-sm text-gray-600">
                  Ask the student to show their QR-OTP and position it within the frame
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-primary-100 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Process Payment</h4>
                <p className="text-sm text-gray-600">
                  The system will process the meal payment and display remaining meals
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ScanQR;
