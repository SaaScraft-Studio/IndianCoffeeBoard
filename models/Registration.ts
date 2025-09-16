// // models/Registration.ts
// import { connectDB } from "@/lib/mongodb";

// export async function getRegistrationCollection() {
//   const db = await connectDB();
//   return db.collection("registrations");
// }

import mongoose, { Schema, Document, models } from "mongoose";

export interface IRegistration extends Document {
  registrationId: string;
  name: string;
  email: string;
  mobile?: string;
  amount: number;
  paymentStatus: "pending" | "success" | "failed";
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define schema
const RegistrationSchema = new Schema<IRegistration>(
  {
    registrationId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String },
    amount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentId: String,
  },
  { timestamps: true }
);

// Avoid model recompilation during Next.js hot reload
export const Registration =
  models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);
