import nodemailer from "nodemailer";
import twilio from "twilio";
import PDFDocument from "pdfkit";
import getStream from "get-stream"; // npm i get-stream
import { RegistrationData } from "@/app/types/registration";

export default async function sendConfirmation(registration: RegistrationData) {
  // 1️⃣ Generate PDF
  const doc = new PDFDocument();
  doc.text(
    `Payment Receipt\n\nName: ${registration.name}\nAmount Paid: ₹${registration.competition}\nRegistration ID: ${registration.registrationId}`
  );
  doc.end();

  const pdfBuffer = await getStream.buffer(doc); // convert PDF stream to Buffer

  // 2️⃣ Send Email using nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Coffee Championship" <${process.env.SMTP_USER}>`,
    to: registration.email,
    subject: "Registration Payment Confirmation",
    text: `Hello ${registration.name}, your payment was successful!`,
    attachments: [{ filename: "receipt.pdf", content: pdfBuffer }],
  });

  // 3️⃣ Send SMS using Twilio
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: registration.mobile,
    body: `Hi ${registration.name}, your payment for registration ${registration.registrationId} was successful.`,
  });
}
