// import { NextRequest, NextResponse } from 'next/server';
// import { RegistrationData } from '@/app/types/registration';

// // Mock database operations - replace with actual MongoDB integration
// const mockDatabase: RegistrationData[] = [];

// export async function POST(request: NextRequest) {
//   try {
//     const body: RegistrationData = await request.json();
    
//     // Validate required fields
//     const requiredFields = ['name', 'email', 'mobile', 'address', 'state', 'pin', 'competition', 'aadhaarNumber'];
//     const missingFields = requiredFields.filter(field => !body[field as keyof RegistrationData]);
    
//     if (missingFields.length > 0) {
//       return NextResponse.json(
//         { error: `Missing required fields: ${missingFields.join(', ')}` },
//         { status: 400 }
//       );
//     }

//     // Check for unique constraints
//     const existingEmail = mockDatabase.find(reg => reg.email === body.email);
//     if (existingEmail) {
//       return NextResponse.json(
//         { error: 'Email already registered' },
//         { status: 409 }
//       );
//     }

//     const existingMobile = mockDatabase.find(reg => reg.mobile === body.mobile);
//     if (existingMobile) {
//       return NextResponse.json(
//         { error: 'Mobile number already registered' },
//         { status: 409 }
//       );
//     }

//     const existingAadhaar = mockDatabase.find(reg => reg.aadhaarNumber === body.aadhaarNumber);
//     if (existingAadhaar) {
//       return NextResponse.json(
//         { error: 'Aadhaar number already registered' },
//         { status: 409 }
//       );
//     }

//     // Create new registration
//     const newRegistration: RegistrationData = {
//       ...body,
//       _id: Math.random().toString(36).substr(2, 9),
//       registrationId: `CFC2025${Date.now()}`,
//       paymentStatus: 'pending',
//       createdAt: new Date(),
//     };

//     mockDatabase.push(newRegistration);

//     return NextResponse.json(
//       { 
//         success: true, 
//         registration: newRegistration,
//         message: 'Registration created successfully' 
//       },
//       { status: 201 }
//     );

//   } catch (error) {
//     console.error('Registration API error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const email = searchParams.get('email');
//     const mobile = searchParams.get('mobile');
//     const aadhaar = searchParams.get('aadhaar');

//     // Check for existing registrations
//     let existing = null;
//     if (email) {
//       existing = mockDatabase.find(reg => reg.email === email);
//     } else if (mobile) {
//       existing = mockDatabase.find(reg => reg.mobile === mobile);
//     } else if (aadhaar) {
//       existing = mockDatabase.find(reg => reg.aadhaarNumber === aadhaar);
//     }

//     return NextResponse.json({
//       exists: !!existing,
//       registration: existing || null
//     });

//   } catch (error) {
//     console.error('Registration check API error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// /app/api/registration/route.ts
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
