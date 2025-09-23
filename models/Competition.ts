import mongoose, { Schema, Document, Model } from "mongoose";

// 1️⃣ Define the interface for TypeScript
export interface CompetitionDocument extends Document {
  name: string;
  price: number;
}

// 2️⃣ Define the Schema
const CompetitionSchema: Schema<CompetitionDocument> = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

// 3️⃣ Define or reuse the Model with explicit typing
const Competition: Model<CompetitionDocument> =
  (mongoose.models.Competition as Model<CompetitionDocument>) ||
  mongoose.model<CompetitionDocument>("Competition", CompetitionSchema);

export default Competition;
