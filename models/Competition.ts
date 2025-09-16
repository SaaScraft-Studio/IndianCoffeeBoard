import mongoose from "mongoose";

const CompetitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const Competition =
  mongoose.models.Competition ||
  mongoose.model("Competition", CompetitionSchema);

export default Competition;
