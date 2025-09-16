import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";

export const dynamic = "force-dynamic";

/**
 * POST /api/registration
 * Create a new registration OR allow retry for pending/failed payment
 */
export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const data = await req.json();

    if (!data.email || !data.aadhaarNumber || !data.name) {
      return NextResponse.json(
        { error: "name, email, and aadhaarNumber are required" },
        { status: 400 }
      );
    }

    // Check for existing registration by email, mobile, or Aadhaar
    const exists = await Registration.findOne({
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
        return NextResponse.json({
          success: true,
          registration: exists,
          retryAllowed: true,
        });
      }

      if (exists.paymentStatus === "success") {
        return NextResponse.json(
          { error: "Email, mobile, or Aadhaar already registered and paid" },
          { status: 409 }
        );
      }
    }

    // ✅ Create new registration document
    const newRegistration = await Registration.create({
      ...data,
      registrationId: `CFC2025${Date.now()}`,
      paymentStatus: "pending",
    });

    return NextResponse.json(
      { success: true, registration: newRegistration },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Registration POST Error:", err);
    return NextResponse.json(
      {
        error: "Server error",
        details: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/registration
 * Update payment status + paymentId after payment gateway callback
 */
export async function PATCH(req: NextRequest) {
  try {
    await connectToDB();
    const { registrationId, paymentStatus, paymentId } = await req.json();

    if (!registrationId || !paymentStatus) {
      return NextResponse.json(
        { error: "registrationId and paymentStatus are required" },
        { status: 400 }
      );
    }

    // ✅ Update registration document and return updated one
    const updated = await Registration.findOneAndUpdate(
      { registrationId },
      {
        paymentStatus,
        ...(paymentId && { paymentId }),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, registration: updated });
  } catch (err) {
    console.error("❌ Registration PATCH Error:", err);
    return NextResponse.json(
      {
        error: "Server error",
        details: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
