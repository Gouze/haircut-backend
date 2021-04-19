const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String },
    notes: [{ type: mongoose.Types.ObjectId, required: true, ref: "Note" }],
    isManager: { type: Boolean, required: true, default: false },
    managedShops: [
      { type: mongoose.Types.ObjectId, required: true, ref: "Shop" },
    ],
    appointments: [
      { type: mongoose.Types.ObjectId, required: true, ref: "Appointment" },
    ],
    isAdmin: { type: Boolean, required: true, default: false },
    isEmailValid: { type: Boolean, required: true, default: false },
    emailValidationToken: { type: String, required: true },
    notificationBySMS: { type: Boolean, required: true, default: false },
    notificationByEmail: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
