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

// ---------- Reconciliation PDFs ----------
// One export function per report kind. Each renders a title, meta, and a table.

export type ReconciliationReportKind = "shop" | "store" | "buffet" | "pnl";

const RWF = (n: number) => `${(Number(n) || 0).toLocaleString()} RWF`;

export const exportReconciliationPDF = (
    kind: ReconciliationReportKind,
    data: any,
) => {
    const doc = new jsPDF();
    doc.setFontSize(18);

    if (kind === "shop") {
        doc.text("Shop Reconciliation", 14, 22);
        doc.setFontSize(11);
        doc.text(`Date: ${data.date}`, 14, 30);
        if (data.branch_name) doc.text(`Branch: ${data.branch_name}`, 14, 37);
        autoTable(doc, {
            head: [["Product", "Source", "Opening", "Received", "Waste", "Closing", "Sold", "Selling", "Revenue", "Buying cost", "Ingredient cost", "Margin"]],
            body: (data.lines || []).map((l: any) => [
                l.product_name,
                l.source ?? "",
                l.opening_qty,
                l.received_qty,
                l.waste_qty,
                l.closing_qty,
                l.sold_qty,
                RWF(l.selling_price),
                RWF(l.revenue),
                l.buying_cost ? RWF(l.buying_cost) : "—",
                l.ingredient_cost ? RWF(l.ingredient_cost) : "—",
                RWF(l.margin),
            ]),
            startY: data.branch_name ? 42 : 38,
            theme: "grid",
            styles: { fontSize: 7 },
            headStyles: { fillColor: [66, 133, 244] },
        });
        const afterY = (doc as any).lastAutoTable?.finalY || 60;
        doc.setFontSize(11);
        doc.text(`Expected revenue: ${RWF(data.totals?.revenue_expected ?? 0)}`, 14, afterY + 10);
        doc.text(`Actual cash: ${RWF(data.totals?.cash_actual ?? 0)}`, 14, afterY + 17);
        doc.text(`Cash variance: ${RWF(data.totals?.cash_variance ?? 0)}`, 14, afterY + 24);
        doc.text(`Bought cost (resold): ${RWF(data.totals?.bought_cost ?? 0)}`, 14, afterY + 31);
        doc.text(`Ingredient cost (produced): ${RWF(data.totals?.ingredient_cost ?? 0)}`, 14, afterY + 38);
        doc.text(`Margin: ${RWF(data.totals?.margin ?? 0)}`, 14, afterY + 45);
    }

    if (kind === "store") {
        doc.text("Store Variance", 14, 22);
        doc.setFontSize(11);
        doc.text(`From ${data.from} to ${data.to}`, 14, 30);
        autoTable(doc, {
            head: [["Item", "Unit", "# Counts", "Avg variance", "Worst variance"]],
            body: (data.items || []).map((i: any) => [
                i.item_name, i.unit, i.counts, i.avg_variance, i.worst_variance,
            ]),
            startY: 38,
            theme: "grid",
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 133, 244] },
        });
    }

    if (kind === "buffet") {
        doc.text("Buffet Gap", 14, 22);
        doc.setFontSize(11);
        doc.text(`Date: ${data.date}`, 14, 30);
        if (data.branch_name) doc.text(`Branch: ${data.branch_name}`, 14, 37);

        // Per-tier scan/exception aggregates.
        if (Array.isArray(data.by_tier) && data.by_tier.length > 0) {
            autoTable(doc, {
                head: [["Tier", "Shifts covering", "Scans", "Exceptions"]],
                body: data.by_tier.map((t: any) => [
                    t.meal_type, t.shifts_covering ?? 1, t.scans, t.exceptions,
                ]),
                startY: data.branch_name ? 42 : 38,
                theme: "grid",
                styles: { fontSize: 9 },
                headStyles: { fillColor: [66, 133, 244] },
            });
        }

        const afterTier = (doc as any).lastAutoTable?.finalY || (data.branch_name ? 42 : 38);
        autoTable(doc, {
            head: [["Shift", "Tiers", "Scanner", "Plates out", "Remaining", "Scans", "Exceptions", "Gap plates", "Gap RWF"]],
            body: (data.shifts || []).map((s: any) => [
                s.shift_id,
                Array.isArray(s.meal_types) ? s.meal_types.join(" + ") : (s.meal_type ?? ""),
                s.scanner_name, s.plates_out, s.remaining ?? 0, s.scans, s.exceptions, s.gap_plates, RWF(s.gap_rwf),
            ]),
            startY: afterTier + 6,
            theme: "grid",
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 133, 244] },
        });
        const afterY = (doc as any).lastAutoTable?.finalY || 60;
        doc.text(`Total gap: ${data.totals?.gap_plates ?? 0} plates (${RWF(data.totals?.gap_rwf ?? 0)})`, 14, afterY + 10);
    }

    if (kind === "pnl") {
        doc.text("Daily P&L", 14, 22);
        doc.setFontSize(11);
        doc.text(`Date: ${data.date}`, 14, 30);
        if (data.branch_name) doc.text(`Branch: ${data.branch_name}`, 14, 37);
        autoTable(doc, {
            head: [["Category", "Line", "Destination", "Amount"]],
            body: [
                ["Income", "Shop revenue",           "—",               RWF(data.income?.shop_revenue ?? 0)],
                ["Income", "Buffet revenue",         "—",               RWF(data.income?.buffet_revenue ?? 0)],
                ["Cost",   "Ingredients issued",    "Shop production", RWF(data.cost?.ingredients_issued_shop ?? 0)],
                ["Cost",   "Ingredients issued",    "Buffet",          RWF(data.cost?.ingredients_issued_buffet ?? 0)],
                ["Cost",   "Direct-use purchases", "Shop production", RWF(data.cost?.direct_use_shop ?? 0)],
                ["Cost",   "Direct-use purchases", "Buffet",          RWF(data.cost?.direct_use_buffet ?? 0)],
                ["Cost",   "Bought goods (resold)", "Shop",           RWF(data.cost?.bought_goods ?? 0)],
                ["Cost",   "Labor (salary, prorated)","Payroll",       RWF(data.cost?.labor_salary ?? 0)],
                ["Cost",   "Waste",                 "—",               RWF(data.cost?.waste_cost ?? 0)],
            ],
            startY: data.branch_name ? 42 : 38,
            theme: "grid",
            styles: { fontSize: 9 },
            headStyles: { fillColor: [66, 133, 244] },
        });
        const afterY = (doc as any).lastAutoTable?.finalY || 60;
        doc.setFontSize(12);
        doc.text(`Total income: ${RWF(data.total_income)}`, 14, afterY + 10);
        doc.text(`Total cost: ${RWF(data.total_cost)}`, 14, afterY + 17);
        doc.text(`Margin: ${RWF(data.margin)}`, 14, afterY + 24);
    }

    doc.save(`reconciliation_${kind}_${new Date().toISOString().split('T')[0]}.pdf`);
};