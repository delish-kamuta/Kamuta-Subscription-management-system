import { generateQrOtpForUser } from "~/services/qr";

export interface QrData {
  qr_code: string;
  user_name: string;
  expires_in_seconds: number;
}

export interface QrState {
  loading: boolean;
  error: string;
  data: QrData | null;
  image: string;
}

export const handleGenerateQr = async (
  userId: string,
  setQrState: (state: Partial<QrState>) => void
) => {
  try {
    setQrState({ loading: true, error: '', data: null, image: '' });
    const resp = await generateQrOtpForUser(userId);
    
    if (!resp.success) {
      setQrState({ loading: false, error: resp.message || 'Failed to generate QR-OTP' });
      return;
    }

    const qrData = resp.data || null;
    let qrImage = '';

    try {
      const QRCode = (await import('qrcode')).default;
      qrImage = await QRCode.toDataURL(qrData?.qr_code || '', { width: 256, margin: 1 });
    } catch {
      qrImage = '';
    }

    setQrState({ loading: false, data: qrData, image: qrImage });
  } catch (e) {
    setQrState({ 
      loading: false, 
      error: e instanceof Error ? e.message : 'QR-OTP error' 
    });
  }
};

export const printQrTicket = (contentId: string) => {
  const content = document.getElementById(contentId);
  if (!content) {
    alert('Ticket content not found to print.');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=300,height=500');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Meal Ticket</title>
          <style>
            @page { margin: 2mm; }
            body { font-family: 'Courier New', Courier, monospace; padding: 0; margin: 0; }
            .ticket { max-width: 57mm; width: 100%; margin: 0 auto; }
            .text-center { text-align: center; }
            .font-semibold { font-weight: 600; }
            .tracking-wide { letter-spacing: 0.025em; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; }
            .gap-1 { gap: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .text-xs { font-size: 11px; line-height: 1.2; }
            .break-all { word-break: break-all; }
            .border-t { border-top: 1px dashed #000; }
            .my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
            .qr { display: flex; justify-content: center; margin: 0.5rem 0; }
            .qr img { max-width: 80% !important; height: auto !important; }
          </style>
        </head>
        <body>
          ${content.outerHTML}
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

export const downloadQrTicket = (contentId: string, ticketId?: string) => {
  const content = document.getElementById(contentId);
  if (!content) return;
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Meal Ticket ${ticketId ? `- ${ticketId}` : ''}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; }
      .ticket { max-width: 420px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 16px; }
      pre { white-space: pre-wrap; margin: 0; }
      .qr { display: flex; align-items: center; justify-content: center; padding: 16px 0; }
    </style>
  </head>
  <body>
    ${content.outerHTML}
  </body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ticket-${ticketId || 'meal'}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
