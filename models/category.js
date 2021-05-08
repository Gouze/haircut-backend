const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    order: { type: Number },
    services: [
      { type: mongoose.Types.ObjectId, required: true, ref: "Service" },
    ],
    shop: { type: mongoose.Types.ObjectId, required: true, ref: "Shop" },
    isSoftDeleted: { type: Boolean, required: true, default: false },
    gender: { type: String },
  },
  { timestamps: true }
);

categorySchema.plugin(uniqueValidator);
module.exports = mongoose.model("Category", categorySchema);
