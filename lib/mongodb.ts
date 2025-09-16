import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

const MONGODB_URI_STR: string = MONGODB_URI;

let isConnected = false; // track connection state

export async function connectToDB() {
  if (!isConnected) {
    try {
      await mongoose.connect(MONGODB_URI_STR, {
        dbName: process.env.MONGODB_DB || "coffee_championship",
      });

      isConnected = true;
      console.log("✅ MongoDB connected");
    } catch (error) {
      console.error("❌ MongoDB connection error", error);
      throw new Error("Failed to connect to MongoDB");
    }
  }

  // ✅ Return native MongoDB Database instance for collection()
  return mongoose.connection.db;
}
