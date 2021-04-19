const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Appointment = require("../models/appointment");
const User = require("../models/user");

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

exports.getAppointmentsByUserId = getAppointmentsByUserId;
