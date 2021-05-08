const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Appointment = require("../models/appointment");
const Timeslot = require("../models/timeslot");
const User = require("../models/user");
const Shop = require("../models/shop");

const getAppointmentsByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let notes;
  let myAppointments;
  try {
    myAppointments = await Appointment.find({ customer: userId }).populate(
      "service"
    );
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
    return next(error);
  }

  if (!myAppointments) {
    return next(
      new HttpError("Could not find a notes for the provided user id.", 404)
    );
  }

  res.json({
    appointments: myAppointments,
  });
};
const getAppointmentsByShops = async (req, res, next) => {
  const userId = req.params.uid;
  // let notes;
  let myAppointments;
  try {
    myAppointments = await Appointment.find({ customer: userId }).populate(
      "service"
    );
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
    return next(error);
  }

  if (!myAppointments) {
    return next(
      new HttpError("Could not find a notes for the provided user id.", 404)
    );
  }

  res.json({
    appointments: myAppointments,
  });
};

const adminGetMyAppointments = async (req, res, next) => {
  const shopId = req.params.shopId;
  console.log(shopId);
  try {
    myAppointments = await Appointment.find({ shop: shopId })
      .populate("service")
      .populate("customer")
      .populate("slots");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
    return next(error);
  }

  if (!myAppointments) {
    return next(
      new HttpError("Could not find a notes for the provided user id.", 404)
    );
  }
  // console.log(myAppointments);
  res.json({
    appointments: myAppointments,
  });
};

const adminCancelAppointment = async (req, res, next) => {
  const appointmentId = req.body.aId;

  try {
    appointmentToDelete = await Appointment.findById(appointmentId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
  }
  if (!appointmentToDelete) {
    return next(
      new HttpError(
        "Could not find an appointment for the provided user id.",
        404
      )
    );
  }

  try {
    slotsToFree = await Timeslot.find({
      _id: { $in: appointmentToDelete.slots },
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
  }

  if (!slotsToFree) {
    return next(
      new HttpError("Could not find an slot for the provided user id.", 404)
    );
  }
  try {
    userToFree = await User.findById(appointmentToDelete.customer);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
  }

  if (!userToFree) {
    return next(
      new HttpError("Could not user an slot for the provided user id.", 404)
    );
  }
  try {
    shopToFree = await Shop.findById(appointmentToDelete.shop);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
  }

  if (!shopToFree) {
    return next(
      new HttpError("Could not user an slot for the provided user id.", 404)
    );
  }
  console.log(shopToFree);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await appointmentToDelete.remove({ session: sess });

    slotsToFree.map(async (timeslot) => {
      timeslot.appointment = null;
      timeslot.booked = false;
      await timeslot.save({ session: sess });
    });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Somehting went wrong, could not create appointment",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted" });
};
const cancelAppointment = async (req, res, next) => {
  const appointmentId = req.body.appointment;

  try {
    appointmentToDelete = await Appointment.findById(appointmentId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
  }
  if (!appointmentToDelete) {
    return next(
      new HttpError(
        "Could not find an appointment for the provided user id.",
        404
      )
    );
  }

  try {
    slotsToFree = await Timeslot.find({
      _id: { $in: appointmentToDelete.slots },
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
  }

  if (!slotsToFree) {
    return next(
      new HttpError("Could not find an slot for the provided user id.", 404)
    );
  }
  try {
    userToFree = await User.findById(appointmentToDelete.customer);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
  }

  if (!userToFree) {
    return next(
      new HttpError("Could not user an slot for the provided user id.", 404)
    );
  }
  try {
    shopToFree = await Shop.findById(appointmentToDelete.shop);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an appointment",
      500
    );
  }

  if (!shopToFree) {
    return next(
      new HttpError("Could not user an slot for the provided user id.", 404)
    );
  }
  console.log(shopToFree);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await appointmentToDelete.remove({ session: sess });

    slotsToFree.map(async (timeslot) => {
      timeslot.appointment = null;
      timeslot.booked = false;
      await timeslot.save({ session: sess });
    });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Somehting went wrong, could not create appointment",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "deleted" });
};

exports.getAppointmentsByUserId = getAppointmentsByUserId;
exports.getAppointmentsByShops = getAppointmentsByShops;
exports.adminGetMyAppointments = adminGetMyAppointments;
exports.adminCancelAppointment = adminCancelAppointment;
exports.cancelAppointment = cancelAppointment;
