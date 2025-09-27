import PDFDocument from "pdfkit";
import getStream from "get-stream";
import path from "path";
import QRCode from "qrcode";

interface ReceiptData {
  name: string;
  competitionName: string;
  city: string;
  registrationId: string;
  amount: number;
  paymentId: string;
  date: string;
}

export async function generateReceipt(data: ReceiptData) {
  const doc = new PDFDocument({ margin: 50 });
  const stream = doc.pipe(getStream.buffer());

  // === HEADER ===
  const logoPath = path.join(process.cwd(), "public", "coffeeHeader.jpg");
  try {
    doc.image(logoPath, { fit: [500, 120], align: "center" });
  } catch (e) {
    console.warn("⚠️ Logo not found:", e);
  }

  doc.moveDown(1);
  doc
    .fontSize(22)
    .fillColor("#6b2d1f")
    .text("India International Coffee Festival 2026", { align: "center" });

  doc.moveDown(0.3);
  doc
    .fontSize(16)
    .fillColor("#333333")
    .text("Registration Receipt", { align: "center" });

  doc.moveDown(1.5);

  // === PARTICIPANT DETAILS ===
  doc
    .fontSize(12)
    .fillColor("black")
    .text(`Date: ${data.date}`, { align: "right" });

  doc.moveDown(0.8);
  doc
    .fontSize(14)
    .fillColor("#6b2d1f")
    .text("Participant Details", { underline: true });

  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("black");
  doc.text(`Name: ${data.name}`);
  doc.text(`Competition: ${data.competitionName}`);
  doc.text(`City: ${data.city}`);

  doc.moveDown(1.2);

  // === PAYMENT TABLE ===
  doc
    .fontSize(14)
    .fillColor("#6b2d1f")
    .text("Payment Information", { underline: true });
  doc.moveDown(0.8);

  const tableTop = doc.y;
  const tableLeft = 50;
  const tableWidth = 500;
  const rowHeight = 30;

  const rows = [
    { label: "Registration ID", value: data.registrationId },
    { label: "Payment ID", value: data.paymentId },
    { label: "Amount Paid", value: `₹${data.amount}` },
  ];

  // Table border
  doc
    .rect(tableLeft, tableTop, tableWidth, rowHeight * (rows.length + 1))
    .strokeColor("#6b2d1f")
    .lineWidth(1)
    .stroke();

  // Header row background
  doc
    .rect(tableLeft, tableTop, tableWidth, rowHeight)
    .fillColor("#fce9e4")
    .fill();

  // Table headers
  doc
    .fillColor("#6b2d1f")
    .fontSize(12)
    .text("Field", tableLeft + 10, tableTop + 8)
    .text("Details", tableLeft + tableWidth / 2 + 10, tableTop + 8);

  // Table rows
  rows.forEach((row, i) => {
    const y = tableTop + rowHeight * (i + 1);

    // Alternating background
    if (i % 2 === 0) {
      doc.rect(tableLeft, y, tableWidth, rowHeight).fillColor("#f9f9f9").fill();
    }

    // Row text
    doc
      .fillColor("#333333")
      .fontSize(12)
      .text(row.label, tableLeft + 10, y + 8)
      .text(row.value, tableLeft + tableWidth / 2 + 10, y + 8);
  });

  doc.moveDown(2);

  // === QR CODE (Centered) ===
  const qrData = await QRCode.toDataURL(data.registrationId, { margin: 1 });
  const qrImage = qrData.replace(/^data:image\/png;base64,/, "");

  const qrWidth = 150;
  const pageWidth = doc.page.width;
  const qrX = (pageWidth - qrWidth) / 2;

  doc.image(Buffer.from(qrImage, "base64"), qrX, doc.y, { width: qrWidth });
  doc.moveDown(8);

  doc
    .fontSize(12)
    .fillColor("#6b2d1f")
    .text("Scan at Event Check-In", { align: "center" });

  doc.moveDown(3);

  // === FOOTER ===
  doc
    .fontSize(12)
    .fillColor("#555555")
    .text(
      "Thank you for registering! We look forward to seeing you at the Coffee Championship.",
      { align: "center" }
    );

  doc.moveDown(1);
  doc
    .fontSize(10)
    .fillColor("#888888")
    .text("© 2026 India Coffee Board", { align: "center" });

  doc.end();

  const buffer = await stream;
  return buffer.toString("base64");
}
