const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String },
    shops: [{ type: mongoose.Types.ObjectId, required: true, ref: "Shop" }],
    isSuperAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

adminSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Admin", adminSchema);
