import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export function rowsToCsv(
  headers: string[],
  rows: (string | number | null)[][]
): string {
  const escape = (v: string | number | null) => {
    const s = String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

export async function rowsToExcel(
  sheetName: string,
  headers: string[],
  rows: (string | number | null)[][]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.addRow(headers);
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function rowsToPdf(
  title: string,
  headers: string[],
  rows: (string | number | null)[][]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text(title, { align: "center" });
    doc.moveDown();
    doc.fontSize(9);

    const colWidth = (doc.page.width - 80) / headers.length;
    let y = doc.y;
    headers.forEach((h, i) => {
      doc.text(h, 40 + i * colWidth, y, { width: colWidth, continued: false });
    });
    y += 16;
    doc.moveTo(40, y).lineTo(doc.page.width - 40, y).stroke();
    y += 8;

    rows.forEach((row) => {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 40;
      }
      row.forEach((cell, i) => {
        doc.text(String(cell ?? ""), 40 + i * colWidth, y, {
          width: colWidth,
          continued: false,
        });
      });
      y += 14;
    });

    doc.end();
  });
}

export function exportResponse(
  content: Buffer | string,
  filename: string,
  format: "pdf" | "excel" | "csv"
) {
  const types = {
    pdf: "application/pdf",
    excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
  };
  const ext = { pdf: "pdf", excel: "xlsx", csv: "csv" };

  return new Response(typeof content === "string" ? content : new Uint8Array(content), {
    headers: {
      "Content-Type": types[format],
      "Content-Disposition": `attachment; filename="${filename}.${ext[format]}"`,
    },
  });
}
