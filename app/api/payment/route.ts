// /app/api/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/mongodb";
import jsPDF from "jspdf";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const dynamic = "force-dynamic";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay keys not set in .env.local");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Signature verification helper
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

    // ✅ Validate request fields
    if (!paymentId || !orderId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: "`paymentId`, `orderId` and `signature` are required",
        },
        { status: 400 }
      );
    }
    if (!registrationId || !amount || !currency) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Verify Razorpay signature before proceeding
    const isValid = verifySignature(orderId, paymentId, signature);
    if (!isValid) {
      console.error("❌ Invalid Razorpay Signature");
      return NextResponse.json(
        { success: false, error: "Invalid Razorpay signature" },
        { status: 400 }
      );
    }

    // ✅ Fetch payment details (no capture needed for Standard Checkout)
    const payment = await razorpay.payments.fetch(paymentId);

    const paymentStatus: "success" | "failed" =
      payment.status === "captured" ? "success" : "failed";

    // ✅ Update DB with payment result
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

    // ✅ Send confirmation email only if successful
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

// ✅ Confirmation email with PDF receipt
async function sendConfirmation(
  customer: { name: string; email: string; mobile: string },
  registrationId: string,
  amount: number
) {
  // 1️⃣ Generate PDF receipt
  const doc = new jsPDF();
  doc.text(
    `Registration Receipt\n\nRegistration ID: ${registrationId}\nAmount Paid: ₹${amount}`,
    10,
    10
  );
  const pdfData = doc.output("arraybuffer");

  // 2️⃣ Send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
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
