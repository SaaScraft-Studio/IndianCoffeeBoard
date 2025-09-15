// models/Registration.ts
import { connectDB } from "@/lib/mongodb";

export async function getRegistrationCollection() {
  const db = await connectDB();
  return db.collection("registrations");
}
