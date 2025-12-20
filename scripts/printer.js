const escpos = require('escpos');
// Ensure adapters are installed:
// npm install escpos-usb escpos-network
try {
  escpos.USB = require('escpos-usb');
  escpos.Network = require('escpos-network');
} catch (e) {
  console.warn('Please install adapters: npm install escpos-usb escpos-network');
}

/**
 * Prints a meal ticket on a POS58 thermal printer.
 * 
 * @param {Object} ticket - Ticket details
 * @param {string} ticket.id - Ticket ID
 * @param {string} ticket.date - Date string
 * @param {string} ticket.clientName - Client name
 * @param {string} ticket.regNumber - Registration number
 * @param {Object} config - Printer configuration
 * @param {string} [config.type='network'] - 'network', 'usb', or 'bluetooth'
 * @param {string} [config.ip] - IP address for network printer
 * @param {number} [config.port=9100] - Port for network printer
 * @param {number} [config.vid] - Vendor ID for USB printer
 * @param {number} [config.pid] - Product ID for USB printer
 * @param {string} [config.address] - Bluetooth address
 */
const printMealTicket = (ticket, config = { type: 'network' }) => {
  let device;

  try {
    if (config.type === 'network') {
      device = new escpos.Network(config.ip || '192.168.1.100', config.port || 9100);
    } else if (config.type === 'usb') {
      // If VID/PID are provided, use them, otherwise auto-detect
      device = (config.vid && config.pid) 
        ? new escpos.USB(config.vid, config.pid) 
        : new escpos.USB();
    } else if (config.type === 'bluetooth') {
      try {
        const Bluetooth = require('escpos-bluetooth');
        device = new Bluetooth(config.address);
      } catch (e) {
        console.error('escpos-bluetooth package is missing. Install it to use Bluetooth.');
        return;
      }
    } else {
      console.error('Unsupported printer type. Use "network", "usb", or "bluetooth".');
      return;
    }
  } catch (err) {
    console.error('Error initializing device adapter:', err.message);
    return;
  }

  const options = { encoding: "GB18030" /* Common for POS58 */ };
  const printer = new escpos.Printer(device, options);

  device.open((error) => {
    if (error) {
      console.error('Failed to open printer:', error);
      return;
    }

    printer
      .font('a')
      .align('ct')
      .style('b')
      .size(1, 1)
      .text('MEAL TICKET')
      .size(0, 0)
      .style('normal')
      .text('') // Empty line
      .align('lt')
      .text(`Ticket ID: ${ticket.id}`)
      .text(`Date: ${ticket.date}`)
      .text(`Client: ${ticket.clientName}`)
      .text(`Reg #: ${ticket.regNumber}`)
      .text('')
      .align('ct')
      .qrimage(ticket.id, { type: 'png', mode: 'dhdw', size: 3 }, (err) => {
        if (err) {
          console.error('QR Code Error:', err);
        }
        
        printer
          .feed(4) // Feed 3-5 lines
          .cut()
          .close();
      });
  });
};

// Example usage if run directly
if (require.main === module) {
  printMealTicket({
    id: 'TKT-12345',
    date: new Date().toLocaleString(),
    clientName: 'John Doe',
    regNumber: 'REG-001'
  }, { type: 'network', ip: '192.168.1.87' });
}

module.exports = { printMealTicket };
