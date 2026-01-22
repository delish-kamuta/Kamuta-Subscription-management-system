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

  // Create a hidden iframe to handle printing (bypasses popup blockers)
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  
  document.body.appendChild(iframe);
  
  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback if iframe cannot be accessed
    alert('Printing failed: could not create print context.'); 
    return; 
  }

  doc.open();
  doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Meal Ticket</title>
          <style>
            @page { margin: 2mm; size: auto; }
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
            window.onload = () => { 
                setTimeout(() => { 
                    try {
                        window.print(); 
                    } catch(e) {
                        console.error('Print error:', e);
                    }
                }, 800); 
            };
          </script>
        </body>
      </html>
    `);
  doc.close();

  // Clean up iframe after a delay to allow print dialog to engage
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 10000);
};

export const downloadQrTicket = async (contentId: string, ticketId?: string) => {
  const original = document.getElementById(contentId);
  if (!original) return;

  try {
    const html2canvas = (await import('html2canvas')).default;

    // Create a robust clone for capturing
    const clone = original.cloneNode(true) as HTMLElement;
    
    // Explicitly set styles to ensure correct rendering off-screen
    // We match the approximate width of the ticket in the UI
    clone.style.width = '380px'; 
    clone.style.height = 'auto';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.background = '#ffffff';
    clone.style.padding = '20px';
    clone.style.margin = '0'; // Remove margins that might shift it
    // Ensure text color is black for contrast
    clone.style.color = '#000000';
    
    // Remove conflicting IDs to avoid DOM issues
    clone.removeAttribute('id');
    
    document.body.appendChild(clone);

    // Wait for any images in the clone to signal they are loaded
    // (Crucial for the QR code image)
    const images = clone.querySelectorAll('img');
    await Promise.all(
        Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        })
    );
    
    // Short delay to ensure layout is stable
    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas(clone, {
      scale: 2, 
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      useCORS: true,
    });

    document.body.removeChild(clone);

    // Convert to JPG and download
    const image = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.href = image;
    link.download = `ticket-${ticketId || 'meal'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Ticket download failed:', error);
    alert('Could not generate ticket image.');
  }
};
