import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useEffect, useState } from "react";
import { generateSelfQrOtp } from "~/services/qr";

const MyQRCode = () => {
  const [userName, setUserName] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [qrImage, setQrImage] = useState<string>("");
  const [expiresIn, setExpiresIn] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function onGenerate() {
    try {
      setLoading(true); setError("");
      const resp = await generateSelfQrOtp();
      if (!resp.success) { setError(resp.message || "Failed to generate QR-OTP"); return; }
      setUserName(resp.data?.user_name || "");
      setQrCode(resp.data?.qr_code || "");
      setExpiresIn(Number(resp.data?.expires_in_seconds ?? 0));
    } catch (e) {
      setError(e instanceof Error ? e.message : "QR-OTP error");
    } finally {
      setLoading(false);
    }
  }

  // Render QR image from qrCode string
  useEffect(() => {
    let mounted = true;
    const gen = async () => {
      if (!qrCode) { setQrImage(""); return; }
      try {
        const QRCode = (await import('qrcode')).default;
        const url = await QRCode.toDataURL(qrCode, { width: 320, margin: 1 });
        if (!mounted) return;
        setQrImage(url);
      } catch {
        // fallback: clear image if generation fails
        if (mounted) setQrImage("");
      }
    };
    gen();
    return () => { mounted = false; };
  }, [qrCode]);

  return (
    <main className='my-qr-code wrapper'>
      <Header
        title="My QR Code"
        description="Scan this QR code at the cafeteria to log your meals"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      {/* QR-OTP Display Section */}
      <section className="flex flex-col items-center justify-center gap-6 py-8">
        {loading && (
          <div className="w-64 h-24 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-500">Generating QR-OTP…</div>
        )}
        {error && (
          <div className="max-w-md w-full rounded p-3 bg-red-50 text-red-700 text-sm text-center">{error}</div>
        )}
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
          onClick={onGenerate}
          disabled={loading}
        >
          {qrCode ? 'Regenerate QR-OTP' : 'Generate QR-OTP'}
        </button>
        {qrCode && (
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center gap-3">
            {qrImage ? (
              <img src={qrImage} alt="QR-OTP" className="w-64 h-64" />
            ) : (
              <div className="font-mono text-xs break-all p-3 bg-gray-50 border rounded w-80 text-center">{qrCode}</div>
            )}
            <p className="text-sm text-gray-600">Expires in: {expiresIn}s</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-lg font-semibold">{userName}</p>
          <p className="text-sm text-gray-500">Your digital QR-OTP</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-md max-w-md text-center">
          <p className="text-sm text-blue-800">
            Show this QR-OTP to the cafeteria staff to record your meal. This code expires automatically.
          </p>
        </div>
      </section>
    </main>
  );
};

export default MyQRCode;
