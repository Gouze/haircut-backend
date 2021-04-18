const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const calendarSchema = new Schema(
  {
    startDate: { type: Date, required: true, unique: true },
    endDate: { type: Date, required: true },
    excludedDays: [{ type: Date, required: true }],
    schedulePattern: [
      {
        day: { type: Number, required: true },
        hours: [[{ type: String, required: true }]],
      },
    ],
    timeslots: [{ type: mongoose.Types.ObjectId, ref: "Timeslot" }],
    shop: { type: mongoose.Types.ObjectId, ref: "Shop" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Calendar", calendarSchema);
