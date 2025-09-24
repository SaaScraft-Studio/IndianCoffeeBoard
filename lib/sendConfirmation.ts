import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import getStream from "get-stream";
import path from "path";
import fs from "fs";

interface EmailRegistrationData {
  name: string;
  email: string;
  mobile: string;
  city: string;
  competitionName: string;
  registrationId: string;
  amount: number;
  paymentId: string;
}

export default async function sendConfirmation(
  registration: EmailRegistrationData
) {
  const doc = new PDFDocument({ margin: 50 });

  const fontPath = path.join(
    process.cwd(),
    "public/fonts/NotoSans-Regular.ttf"
  );
  if (fs.existsSync(fontPath)) doc.registerFont("NotoSans", fontPath);
  doc.font(fs.existsSync(fontPath) ? "NotoSans" : "Helvetica");

  doc
    .fontSize(20)
    .text("National Coffee Championships 2025", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text("✅ Registration Confirmation", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(12).text(`Name: ${registration.name}`);
  doc.text(`Mobile: ${registration.mobile}`);
  doc.text(`City: ${registration.city}`);
  doc.text(`Competition: ${registration.competitionName}`);
  doc.text(`Registration ID: ${registration.registrationId}`);
  doc.moveDown();
  doc.text(`Payment Status: Successful`);
  doc.text(`Amount Paid: Rs.${registration.amount.toLocaleString("en-IN")}`);
  doc.text(`Payment Reference: ${registration.paymentId}`);
  doc.moveDown(2);
  doc.text("Please keep this receipt for your records.", { align: "center" });

  doc.end();
  const pdfBuffer = await getStream.buffer(doc);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const emailHtml = `
    <p>Hello ${registration.name},</p>
    <p>Your registration for <strong>${
      registration.competitionName
    }</strong> is confirmed!</p>
    <ul>
      <li>Registration ID: ${registration.registrationId}</li>
      <li>Name: ${registration.name}</li>
      <li>Mobile: ${registration.mobile}</li>
      <li>Competition: ${registration.competitionName}</li>
      <li>Amount Paid: ₹${registration.amount.toLocaleString("en-IN")}</li>
      <li>Payment Reference: ${registration.paymentId}</li>
    </ul>
    <p>Thanks,<br/>Organizing Team</p>
  `;

  await transporter.sendMail({
    from: `"National Coffee Championships" <${process.env.SMTP_USER}>`,
    to: registration.email,
    subject:
      "✅ Registration Confirmation – National Coffee Championships 2025",
    html: emailHtml,
    attachments: [{ filename: "Registration_Receipt.pdf", content: pdfBuffer }],
  });

  console.log("✅ Confirmation email sent successfully to", registration.email);
}
