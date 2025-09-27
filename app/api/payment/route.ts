// app/api/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectToDB } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import jsPDF from "jspdf";
// import nodemailer from "nodemailer";
import { sendZeptoMail } from "@/lib/zeptoMail";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      registrationId,
      amount,
      currency,
      customerInfo,
      paymentId,
      orderId,
      signature,
    } = body;

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json(
        { success: false, error: "Missing payment fields" },
        { status: 400 }
      );
    }

    await connectToDB();

    const isValid = verifySignature(orderId, paymentId, signature);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid Razorpay signature" },
        { status: 400 }
      );
    }

    const payment = await razorpay.payments.fetch(paymentId);
    const paymentStatus: "success" | "failed" =
      payment.status === "captured" ? "success" : "failed";

    // ✅ Use Mongoose model instead of db.collection()
    const registration = await Registration.findOneAndUpdate(
      { registrationId },
      {
        $set: {
          paymentStatus,
          paymentId: payment.id,
        },
      },
      { new: true } // return updated document
    );

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    if (paymentStatus === "success" && customerInfo) {
      await sendConfirmation(
        customerInfo,
        registration.registrationId,
        registration.amount,
        registration.competitionName,
        registration.paymentId,
        registration.city
      );
    }

    return NextResponse.json({
      success: paymentStatus === "success",
      paymentStatus,
      registration,
    });
  } catch (err) {
    console.error("❌ Payment API Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function sendConfirmation(
  customer: { name: string; email: string; mobile: string },
  registrationId: string,
  amount: number,
  competition: string,
  paymentId: string,
  city: string
) {
  if (!customer.email) {
    console.warn("⚠️ Customer email missing, skipping email:", customer);
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(12);

  doc.text("National Coffee Championships 2025", 10, 10);
  doc.text("Registration Receipt", 10, 20);
  doc.text("----------------------------", 10, 30);

  doc.text(`Registration Number: ${registrationId}`, 10, 40);
  doc.text(`Name: ${customer.name}`, 10, 50);
  doc.text(`Mobile: ${customer.mobile}`, 10, 60);
  doc.text(`Competition: ${competition}`, 10, 70);
  doc.text(`Amount Paid: Rs.${amount}`, 10, 80);
  doc.text(`Payment Reference: ${paymentId}`, 10, 90);

  doc.text("----------------------------", 10, 110);
  doc.text("Thank you for registering!", 10, 120);

  const pdfData = doc.output("arraybuffer");
  const pdfBase64 = Buffer.from(pdfData).toString("base64");

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 16px;">
      <h2>✅ Registration Successful</h2>
      <p>Dear ${customer.name},</p>
      <p>Thank you for registering for the <b>${competition}</b> at the 
      <b>${city.toUpperCase()}</b> chapter.</p>
      <p><b>Registration ID:</b> ${registrationId}</p>
      <p><b>Payment ID:</b> ${paymentId}</p>
      <p><b>Amount Paid:</b> ₹ ${amount}</p>
      <p>Please find your receipt attached as a PDF.</p>
      <p>- Coffee Championship Team</p>
    </div>
  `;

  await sendZeptoMail({
    to: customer.email,
    subject: "Registration Confirmation - Coffee Championship",
    html: emailHtml,
    attachments: [
      { name: `Receipt-${registrationId}.pdf`, content: pdfBase64 },
    ],
  });
}
