import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useEffect, useState } from "react";

const MyQRCode = () => {
  const [userName, setUserName] = useState<string>("Guest");
  const [studentId, setStudentId] = useState<string>("");
  const [qrUrl, setQrUrl] = useState<string>('');

  // For demo: populate with sample values if empty
  useEffect(() => {
    if (!userName || userName === 'Guest') setUserName('James Anderson');
    if (!studentId) setStudentId('ST-12345');
  }, []);

  // Generate basic QR with student ID
  // TODO: Replace with backend token when ready
  useEffect(() => {
    if (studentId) {
      const qrData = JSON.stringify({ id: studentId, name: userName });
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrData)}`;
      setQrUrl(url);
    }
  }, [studentId, userName]);

  return (
    <main className='my-qr-code wrapper'>
      <Header
        title="My QR Code"
        description="Scan this QR code at the cafeteria to log your meals"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      {/* QR Code Display Section */}
      <section className="flex flex-col items-center justify-center gap-6 py-8">
        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
          {qrUrl ? (
            <img src={qrUrl} alt="Student QR Code" className="w-64 h-64" />
          ) : (
            <div className="w-64 h-64 bg-gray-200 flex items-center justify-center text-gray-500">Generating QR…</div>
          )}
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{userName}</p>
          <p className="text-sm text-gray-500">Student ID: {studentId}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-md max-w-md text-center">
          <p className="text-sm text-blue-800">
            Show this QR code to the cafeteria staff to record your meal
          </p>
        </div>
      </section>
    </main>
  );
};

export default MyQRCode;
