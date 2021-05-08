const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    validated: { type: Boolean, required: true, default: true },
    slots: [{ type: mongoose.Types.ObjectId, ref: "Timeslot" }],
    customer: { type: mongoose.Types.ObjectId, ref: "User" },
    service: { type: mongoose.Types.ObjectId, ref: "Service", required: false },
    shop: { type: mongoose.Types.ObjectId, ref: "Shop" },
    isSoftDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
