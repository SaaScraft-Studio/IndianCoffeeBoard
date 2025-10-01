import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb"; // ✅ use the mongoose-based connection
import Competition from "@/models/Competition";

export async function GET() {
  try {
    await connectToDB();
    const competitions = await Competition.find({}).lean();
    return NextResponse.json(competitions);
  } catch (error) {
    console.error("❌ Error fetching competitions:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
      { status: 500 }
    );
  }
}

// export async function POST(req: Request) {
//   try {
//     await connectToDB();
//     const body = await req.json();

//     if (!Array.isArray(body)) {
//       return NextResponse.json(
//         { error: "Request body must be an array of competitions" },
//         { status: 400 }
//       );
//     }

//     const inserted = await Competition.insertMany(body);
//     return NextResponse.json({
//       message: "Competitions inserted successfully",
//       inserted,
//     });
//   } catch (error) {
//     console.error("❌ Error inserting competitions:", error);
//     return NextResponse.json(
//       { error: "Failed to insert competitions" },
//       { status: 500 }
//     );
//   }
// }
