import type { Expense } from "@/types/expense";
import type { ExportFilters } from "@/types/export";
import { formatCurrency } from "@/lib/format";

function formatRangeLabel(filters: ExportFilters): string {
  if (filters.startDate && filters.endDate) return `${filters.startDate} to ${filters.endDate}`;
  if (filters.startDate) return `From ${filters.startDate}`;
  if (filters.endDate) return `Through ${filters.endDate}`;
  return "All time";
}

export async function buildPdfBlob(expenses: Expense[], filters: ExportFilters): Promise<Blob> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("Expense Report", 40, 48);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated ${new Date().toLocaleString("en-US")}`, 40, 66);
  doc.text(`Date range: ${formatRangeLabel(filters)}`, 40, 80);
  doc.text(
    `Categories: ${filters.categories.length > 0 ? filters.categories.join(", ") : "All"}`,
    40,
    94
  );

  autoTable(doc, {
    startY: 112,
    head: [["Date", "Category", "Description", "Amount"]],
    body: expenses.map((e) => [e.date, e.category, e.description, formatCurrency(e.amount)]),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 3: { halign: "right" } },
    foot: [["", "", "Total", formatCurrency(total)]],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold" },
  });

  return doc.output("blob");
}
