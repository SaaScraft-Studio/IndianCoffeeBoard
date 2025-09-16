import { NextRequest, NextResponse } from "next/server";
import { getRegistrationCollection } from "@/models/Registration";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const registrations = await getRegistrationCollection();

    // Check duplicates
    const exists = await registrations.findOne({
      $or: [
        { email: data.email },
        { mobile: data.mobile },
        { aadhaarNumber: data.aadhaarNumber },
      ],
    });

    if (exists) {
      return NextResponse.json(
        { error: "Email, mobile, or Aadhaar already exists" },
        { status: 409 }
      );
    }

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const registrations = await getRegistrationCollection();

    const registration = await registrations.findOne({ email });
    return NextResponse.json({ exists: !!registration, registration });
  } catch (err) {
    console.error("❌ Registration GET Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
