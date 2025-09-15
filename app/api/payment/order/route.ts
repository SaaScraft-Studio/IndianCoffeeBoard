// /app/api/payment/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, currency } = await req.json();

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("❌ Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
