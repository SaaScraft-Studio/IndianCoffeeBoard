import { NextRequest, NextResponse } from 'next/server';
import { RegistrationData } from '@/app/types/registration';

// Mock database operations - replace with actual MongoDB integration
const mockDatabase: RegistrationData[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'mobile', 'address', 'state', 'pin', 'competition', 'aadhaarNumber'];
    const missingFields = requiredFields.filter(field => !body[field as keyof RegistrationData]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for unique constraints
    const existingEmail = mockDatabase.find(reg => reg.email === body.email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const existingMobile = mockDatabase.find(reg => reg.mobile === body.mobile);
    if (existingMobile) {
      return NextResponse.json(
        { error: 'Mobile number already registered' },
        { status: 409 }
      );
    }

    const existingAadhaar = mockDatabase.find(reg => reg.aadhaarNumber === body.aadhaarNumber);
    if (existingAadhaar) {
      return NextResponse.json(
        { error: 'Aadhaar number already registered' },
        { status: 409 }
      );
    }

    // Create new registration
    const newRegistration: RegistrationData = {
      ...body,
      _id: Math.random().toString(36).substr(2, 9),
      registrationId: `CFC2025${Date.now()}`,
      paymentStatus: 'pending',
      createdAt: new Date(),
    };

    mockDatabase.push(newRegistration);

    return NextResponse.json(
      { 
        success: true, 
        registration: newRegistration,
        message: 'Registration created successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const mobile = searchParams.get('mobile');
    const aadhaar = searchParams.get('aadhaar');

    // Check for existing registrations
    let existing = null;
    if (email) {
      existing = mockDatabase.find(reg => reg.email === email);
    } else if (mobile) {
      existing = mockDatabase.find(reg => reg.mobile === mobile);
    } else if (aadhaar) {
      existing = mockDatabase.find(reg => reg.aadhaarNumber === aadhaar);
    }

    return NextResponse.json({
      exists: !!existing,
      registration: existing || null
    });

  } catch (error) {
    console.error('Registration check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}