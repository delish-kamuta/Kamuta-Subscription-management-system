import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Camera, CheckCircle2, XCircle, AlertCircle, ScanLine } from "lucide-react";
import { useAppSelector } from "~/store/hooks";
import { Html5Qrcode } from "html5-qrcode";

interface ScanResult {
  success: boolean;
  studentName?: string;
  studentId?: string;
  mealType?: string;
  message: string;
  timestamp?: string;
}

const ScanQR = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
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

  const processQRData = (decodedText: string) => {
    // TODO: Replace with actual API call to verify student subscription
    // For now, parsing mock QR data format: "STD12345|John Doe|Lunch"
    try {
      const parts = decodedText.split('|');
      
      if (parts.length >= 2) {
        const mockResult: ScanResult = {
          success: true,
          studentId: parts[0],
          studentName: parts[1],
          mealType: parts[2] || "Lunch",
          message: "Meal verified successfully",
          timestamp: new Date().toLocaleString()
        };
        
        setScanResult(mockResult);
        setRecentScans(prev => [mockResult, ...prev.slice(0, 4)]);
      } else {
        setScanResult({
          success: false,
          message: "Invalid QR code format",
          timestamp: new Date().toLocaleString()
        });
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: "Error processing QR code",
        timestamp: new Date().toLocaleString()
      });
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
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

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
          // Scan error (can be ignored for continuous scanning)
          // console.log("Scanning...", errorMessage);
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
                  <div id={scannerElementId} className="w-full h-full"></div>
                ) : (
                  <div className="text-center text-gray-400 space-y-3">
                    <Camera className="w-16 h-16 mx-auto opacity-50" />
                    <p>Camera ready to scan</p>
                    <p className="text-xs">Press the button below to start scanning</p>
                    {hasPermission === false && (
                      <p className="text-xs text-red-400">
                        Camera permission denied. Please enable camera access.
                      </p>
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
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        scanResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {scanResult.message}
                      </h3>
                      {scanResult.success && (
                        <div className="mt-2 space-y-1 text-sm text-green-800">
                          <p><strong>Student:</strong> {scanResult.studentName}</p>
                          <p><strong>ID:</strong> {scanResult.studentId}</p>
                          <p><strong>Meal:</strong> {scanResult.mealType}</p>
                          <p className="text-xs text-green-600 mt-2">
                            {scanResult.timestamp}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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
                            {scan.studentName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <p>ID: {scan.studentId}</p>
                          <p>Meal: {scan.mealType}</p>
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
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-white rounded-full flex items-center justify-center font-bold">
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
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Position QR Code</h4>
                <p className="text-sm text-gray-600">
                  Ask the student to show their QR code and position it within the frame
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Verify Result</h4>
                <p className="text-sm text-gray-600">
                  Check the scan result and confirm the student's meal eligibility
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
