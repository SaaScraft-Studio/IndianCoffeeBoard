// /app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRegistrationCollection } from "@/models/Registration";
import sendConfirmation from "@/lib/sendConfirmation";
import { RegistrationData } from "@/app/types/registration";

export const dynamic = "force-dynamic"; // ✅ prevent caching

export async function POST(req: NextRequest) {
  try {
    const webhookBody = await req.json();

    const paymentEntity = webhookBody?.payload?.payment?.entity;
    if (!paymentEntity) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const { razorpay_payment_id, razorpay_order_id, status } = paymentEntity;

    const registrations = await getRegistrationCollection();
    const registration = await registrations.findOne<RegistrationData>({
      registrationId: razorpay_order_id,
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const newPaymentStatus = status === "captured" ? "success" : "failed";

    // Update payment info in DB
    const updated = await registrations.updateOne(
      { registrationId: razorpay_order_id },
      {
        $set: {
          paymentStatus: newPaymentStatus,
          paymentId: razorpay_payment_id,
          updatedAt: new Date(),
        },
      }
    );

    // ✅ Pass a plain object that includes updated fields
    if (newPaymentStatus === "success") {
      await sendConfirmation({
        ...registration,
        paymentStatus: newPaymentStatus,
        paymentId: razorpay_payment_id,
      });
    }

    return NextResponse.json({
      success: true,
      modifiedCount: updated.modifiedCount,
    });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
