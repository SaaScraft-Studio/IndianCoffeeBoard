import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic"; // keeps route dynamic
export const runtime = "nodejs"; // optional, default is nodejs
// export const bodyParser = false; // replaces deprecated config.api.bodyParser

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    // Convert NextRequest to Node IncomingMessage for formidable
    const reqNode = req as any;
    const incomingMsg = reqNode.req;

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const form = formidable({
      multiples: false,
      uploadDir,
      keepExtensions: true,
    });

    const data: any = await new Promise((resolve, reject) => {
      form.parse(incomingMsg, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ ...fields, ...files });
      });
    });

    if (data.passportFile) {
      const file = data.passportFile as File;
      const newFilePath = path.join(
        uploadDir,
        file.originalFilename || file.newFilename
      );
      fs.renameSync(file.filepath, newFilePath);
      data.passportFilePath = `/uploads/${path.basename(newFilePath)}`;
    }

    const requiredFields = [
      "name",
      "email",
      "aadhaarNumber",
      "mobile",
      "address",
      "city",
      "state",
      "pin",
      "competition",
      "acceptedTerms",
      "amount",
    ];

    const missingFields = requiredFields.filter((f) => !(f in data));
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const exists = await Registration.findOne({
      $or: [
        { email: data.email },
        { mobile: data.mobile },
        { aadhaarNumber: data.aadhaarNumber },
      ],
    });

    if (exists) {
      if (["pending", "failed"].includes(exists.paymentStatus)) {
        return NextResponse.json({
          success: true,
          registration: exists.toObject(),
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

    const newRegistrationDoc = await Registration.create({
      ...data,
      registrationId: `CFC2025${Date.now()}`,
      paymentStatus: "pending",
    });

    const newRegistration = { ...newRegistrationDoc.toObject(), ...data };

    return NextResponse.json(
      { success: true, registration: newRegistration, retryAllowed: false },
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

    const updated = await Registration.findOneAndUpdate(
      { registrationId },
      { paymentStatus, ...(paymentId && { paymentId }) },
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
