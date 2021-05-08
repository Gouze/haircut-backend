const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const timeslotSchema = new Schema(
  {
    date: { type: Date, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    booked: { type: Boolean, required: true, default: false },
    appointment: { type: mongoose.Types.ObjectId, ref: "Appointment" },
    shop: { type: mongoose.Types.ObjectId, ref: "Shop" },
    isSoftDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timeslot", timeslotSchema);
