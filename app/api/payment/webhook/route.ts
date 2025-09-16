import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import sendConfirmation from "@/lib/sendConfirmation";

export const dynamic = "force-dynamic"; // ✅ ensure no caching

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

    const { razorpay_payment_id, razorpay_order_id, status } = paymentEntity;

    // ✅ Find registration by orderId (stored as registrationId)
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

    // ✅ Determine new payment status
    const newPaymentStatus = status === "captured" ? "success" : "failed";

    // ✅ Update registration document
    registration.paymentStatus = newPaymentStatus;
    registration.paymentId = razorpay_payment_id;
    await registration.save();

    console.log(
      `✅ Registration ${registration.registrationId} updated to ${newPaymentStatus}`
    );

    // ✅ Send confirmation email only if payment succeeded
    if (newPaymentStatus === "success") {
      try {
        await sendConfirmation({
          ...registration.toObject(), // convert mongoose doc → plain object
          paymentStatus: newPaymentStatus,
          paymentId: razorpay_payment_id,
        });
        console.log(`📧 Confirmation email sent to ${registration.email}`);
      } catch (emailErr) {
        console.error("❌ Failed to send confirmation email:", emailErr);
        // Continue without failing webhook (important for Razorpay)
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
