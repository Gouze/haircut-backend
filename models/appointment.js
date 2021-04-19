const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    service: { type: mongoose.Types.ObjectId, ref: "Service", required: false },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    validated: { type: Boolean, required: true, default: true },
    slots: [{ type: mongoose.Types.ObjectId, ref: "Timeslot" }],
    customer: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
