import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let escpos: any;

try {
  escpos = require('escpos');
  escpos.Network = require('escpos-network');
  escpos.USB = require('escpos-usb');
  // escpos.Bluetooth = require('escpos-bluetooth'); // Optional
} catch (e) {
  console.warn('Printer dependencies missing. Install escpos, escpos-network, escpos-usb');
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
  if (!escpos) throw new Error("ESC/POS libraries not installed");

  return new Promise<void>((resolve, reject) => {
    let device;
    try {
      if (config.type === 'network') {
        device = new escpos.Network(config.ip || '192.168.1.100', config.port || 9100);
      } else if (config.type === 'usb') {
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
