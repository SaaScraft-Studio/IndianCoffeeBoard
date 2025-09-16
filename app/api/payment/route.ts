import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectToDB } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import jsPDF from "jspdf";
import nodemailer from "nodemailer";
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
        registration.amount
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
  amount: number
) {
  const doc = new jsPDF();
  doc.text(
    `Registration Receipt\n\nRegistration ID: ${registrationId}\nAmount Paid: ₹${amount}`,
    10,
    10
  );
  const pdfData = doc.output("arraybuffer");

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
    attachments: [{ filename: "receipt.pdf", content: Buffer.from(pdfData) }],
  });

  console.log(`📩 Email sent to ${customer.email}`);
}
