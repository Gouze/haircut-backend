const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const serviceSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true },
    slotsPattern: [{ type: Boolean, required: true }],
    price: { type: Number },
    showPrice: { type: Boolean, required: true, default: false },
    gender: { type: String },

    shop: { type: mongoose.Types.ObjectId, ref: "Shop" },
    category: { type: mongoose.Types.ObjectId, ref: "Category" },
    isSoftDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
