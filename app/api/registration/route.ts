import { NextRequest, NextResponse } from "next/server";
import { getRegistrationCollection } from "@/models/Registration";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const registrations = await getRegistrationCollection();

    // Check if registration exists
    const exists = await registrations.findOne({
      $or: [
        { email: data.email },
        { mobile: data.mobile },
        { aadhaarNumber: data.aadhaarNumber },
      ],
    });

    if (exists) {
      if (
        exists.paymentStatus === "pending" ||
        exists.paymentStatus === "failed"
      ) {
        // Allow retry by returning existing registration
        return NextResponse.json({
          success: true,
          registration: exists,
          retryAllowed: true,
        });
      } else if (exists.paymentStatus === "success") {
        // Already paid, block duplicate
        return NextResponse.json(
          { error: "Email, mobile, or Aadhaar already registered and paid" },
          { status: 409 }
        );
      }
    }

    // Create new registration
    const newRegistration = {
      ...data,
      paymentStatus: "pending",
      registrationId: `CFC2025${Date.now()}`,
      createdAt: new Date(),
    };

    await registrations.insertOne(newRegistration);

    return NextResponse.json(
      { success: true, registration: newRegistration },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Registration POST Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
