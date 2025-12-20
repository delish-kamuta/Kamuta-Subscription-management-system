import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let escpos: any;

try {
  escpos = require('escpos');
} catch (e) {
  console.error("Failed to load escpos core module:", e);
}

if (escpos) {
  try {
    escpos.Network = require('escpos-network');
  } catch (e) {
    console.warn("Failed to load escpos-network module:", e);
  }

  try {
    escpos.USB = require('escpos-usb');
  } catch (e) {
    console.warn("Failed to load escpos-usb module (this is expected in serverless environments):", e);
  }
}

interface TicketData {
  id: string;
  date: string;
  clientName: string;
  regNumber: string;
}

interface PrinterConfig {
  type: 'network' | 'usb' | 'bluetooth';
  ip?: string;
  port?: number;
  vid?: number;
  pid?: number;
  address?: string;
}

export const printTicket = async (ticket: TicketData, config: PrinterConfig = { type: 'network', ip: '192.168.1.100' }) => {
  if (!escpos) throw new Error("ESC/POS libraries not installed or failed to load");

  return new Promise<void>((resolve, reject) => {
    let device;
    try {
      if (config.type === 'network') {
        if (!escpos.Network) throw new Error("Network printer adapter not loaded");
        device = new escpos.Network(config.ip || '192.168.1.100', config.port || 9100);
      } else if (config.type === 'usb') {
        if (!escpos.USB) throw new Error("USB printer adapter not loaded (requires local server)");
        device = (config.vid && config.pid) 
          ? new escpos.USB(config.vid, config.pid) 
          : new escpos.USB();
      } else if (config.type === 'bluetooth') {
         // device = new escpos.Bluetooth(config.address);
         reject(new Error("Bluetooth not fully supported in this demo yet"));
         return;
      } else {
        reject(new Error("Invalid printer type"));
        return;
      }
    } catch (err: any) {
      if (err?.message === 'Can not find printer') {
         reject(new Error("USB Printer not found. Check connection and ensure WinUSB drivers are installed (use Zadig)."));
      } else {
         reject(err);
      }
      return;
    }

    const options = { encoding: "GB18030" };
    const printer = new escpos.Printer(device, options);

    device.open((error: any) => {
      if (error) {
        reject(error);
        return;
      }

      try {
        printer
          .font('a')
          .align('ct')
          .style('b')
          .size(1, 1)
          .text('MEAL TICKET')
          .size(0, 0)
          .style('normal')
          .text('')
          .align('lt')
          .text(`Ticket ID: ${ticket.id}`)
          .text(`Date: ${ticket.date}`)
          .text(`Client: ${ticket.clientName}`)
          .text(`Reg #: ${ticket.regNumber}`)
          .text('')
          .align('ct');
          
        // QR Code
        printer.qrimage(ticket.id, { type: 'png', mode: 'dhdw', size: 3 }, (err: any) => {
            if (err) {
                console.error("QR Error", err);
                // Continue printing even if QR fails
            }
            printer
                .feed(4)
                .cut()
                .close();
            resolve();
        });
      } catch (e) {
        device.close();
        reject(e);
      }
    });
  });
};
