// /app/api/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/mongodb";
import jsPDF from "jspdf";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

if (
  !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET
) {
  throw new Error("Razorpay keys not set in .env.local");
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId, amount, currency, customerInfo, paymentId } = body;

    // ✅ Validate request
    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "`paymentId` is required" },
        { status: 400 }
      );
    }
    if (!registrationId || !amount || !currency) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Capture Razorpay payment
    const captureAmount = Math.round(amount * 100); // convert ₹ to paise
    const payment = await razorpay.payments.capture(
      paymentId,
      captureAmount,
      currency
    );

    const paymentStatus: "success" | "failed" =
      payment.status === "captured" ? "success" : "failed";

    // ✅ Update DB
    const db = await connectDB();
    await db.collection("registrations").updateOne(
      { registrationId },
      {
        $set: {
          paymentStatus,
          paymentId: payment.id,
          updatedAt: new Date(),
        },
      }
    );

    // ✅ Send confirmation only if successful
    if (paymentStatus === "success" && customerInfo) {
      await sendConfirmation(customerInfo, registrationId, amount);
    }

    return NextResponse.json({
      success: paymentStatus === "success",
      paymentStatus,
      payment,
    });
  } catch (err) {
    console.error("❌ Payment API Error:", err);
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    return NextResponse.json(
      { success: false, paymentStatus: "failed", error: message },
      { status: 500 }
    );
  }
}

// Example confirmation sender (PDF + Email)
async function sendConfirmation(
  customer: { name: string; email: string; mobile: string },
  registrationId: string,
  amount: number
) {
  // 1. Generate PDF
  const doc = new jsPDF();
  doc.text(
    `Registration Receipt\n\nRegistration ID: ${registrationId}\nAmount Paid: ₹${amount}`,
    10,
    10
  );
  const pdfData = doc.output("arraybuffer");

  // 2. Send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customer.email,
    subject: "Registration Confirmation",
    text: `Hi ${customer.name}, your payment was successful!`,
    attachments: [
      {
        filename: "receipt.pdf",
        content: Buffer.from(pdfData),
      },
    ],
  });

  console.log(`📩 Email sent to ${customer.email}`);
  console.log(`📲 SMS to ${customer.mobile}: Payment Successful`);
}
