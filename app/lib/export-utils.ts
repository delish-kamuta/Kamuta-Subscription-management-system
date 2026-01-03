import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const exportWalletTransactionsToPDF = (transactions: any[], userId?: string, userName?: string, userPhone?: string) => {
    if (!transactions || transactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Wallet Transactions", 14, 22);
    
    // Add user info if available
    doc.setFontSize(11);
    if (userName) {
        doc.text(`User Name: ${userName}`, 14, 30);
    }
    if (userPhone) {
        doc.text(`Phone: ${userPhone}`, 14, 36);
    }
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

    const tableColumn = ["Date", "Type", "Category", "Amount", "Reference", "Payment Method", "Description"];
    const tableRows: any[] = [];

    transactions.forEach((t: any) => {
      const dateStr = t.date || t.created_at;
      const formattedDate = dateStr ? new Date(dateStr).toLocaleString() : '-';
      
      const combinedStr = (
        (t.type || '') + ' ' + 
        (t.payment_method || '') + ' ' + 
        (t.method || '') + ' ' + 
        (t.category || '') + ' ' +
        (t.description || '') + ' ' +
        (t.note || '')
      ).toLowerCase();

      const isTopUp = combinedStr.includes('payment') ||
                      combinedStr.includes('credit') ||
                      combinedStr.includes('deposit') ||
                      combinedStr.includes('top') ||
                      combinedStr.includes('cash') ||
                      combinedStr.includes('momo') ||
                      combinedStr.includes('card') ||
                      combinedStr.includes('mobile') ||
                      combinedStr.includes('transfer') ||
                      combinedStr.includes('fund') ||
                      combinedStr.includes('admin');

      const category = isTopUp ? "Top Up" : "Charge";
      const amount = t.amount ?? t.value ?? 0;
      const reference = t.reference || t.id || '';
      const paymentMethod = t.payment_method || t.method || '';
      const description = t.description || t.note || '';

      const rowData = [
        formattedDate,
        t.type || 'VVIP',
        category,
        amount,
        reference,
        paymentMethod,
        description
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 133, 244] }
    });

    doc.save(`wallet_transactions_${userId || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`);
};