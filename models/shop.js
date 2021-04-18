const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const shopSchema = new Schema(
  {
    name: { type: String, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    timeslots: [
      { type: mongoose.Types.ObjectId, required: true, ref: "Timeslots" },
    ],
    managers: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
    services: [
      { type: mongoose.Types.ObjectId, required: true, ref: "Service" },
    ],
    categories: [
      { type: mongoose.Types.ObjectId, required: true, ref: "Category" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", shopSchema);
