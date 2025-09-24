import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import sendConfirmation from "@/lib/sendConfirmation";

export const dynamic = "force-dynamic"; // no caching

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const webhookBody = await req.json();

    const paymentEntity = webhookBody?.payload?.payment?.entity;
    if (!paymentEntity) {
      console.error("❌ Webhook received without payment entity:", webhookBody);
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const { razorpay_payment_id, razorpay_order_id, status, amount } =
      paymentEntity;

    // Find registration by orderId (stored as registrationId)
    const registration = await Registration.findOne({
      registrationId: razorpay_order_id,
    });

    if (!registration) {
      console.warn(
        `⚠️ Registration not found for orderId: ${razorpay_order_id}`
      );
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Determine payment status
    const newPaymentStatus = status === "captured" ? "success" : "failed";

    // Update registration
    registration.paymentStatus = newPaymentStatus;
    registration.paymentId = razorpay_payment_id;
    registration.amount = registration.amount || amount / 100; // Razorpay amount is in paise
    await registration.save();

    console.log("📧 Sending confirmation email with data:", {
      name: registration.name,
      email: registration.email,
      mobile: registration.mobile,
      city: registration.city,
      competitionName: registration.competitionName,
      registrationId: registration.registrationId,
      amount: registration.amount,
      paymentId: registration.paymentId,
    });

    // Send confirmation email only if payment succeeded
    if (newPaymentStatus === "success") {
      try {
        await sendConfirmation({
          name: registration.name,
          email: registration.email,
          mobile: registration.mobile,
          city: registration.city,
          competitionName: registration.competitionName,
          registrationId: registration.registrationId,
          amount: registration.amount,
          paymentId: registration.paymentId,
        });
      } catch (emailErr) {
        console.error("❌ Failed to send confirmation email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.registrationId,
      paymentStatus: registration.paymentStatus,
    });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
