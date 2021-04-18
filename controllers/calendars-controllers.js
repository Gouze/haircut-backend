const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Calendar = require("../models/calendar");
const Shop = require("../models/shop");

//
// Create Calendar
//

const createCalendar = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { startDate, endDate, excludedDays, shop } = req.body;
  const createdCalendar = new Calendar({
    startDate,
    endDate,
    excludedDays,
    shop,
  });

  let fecthedShop;

  try {
    fecthedShop = await Shop.findById(shop);
  } catch (err) {
    const error = new HttpError(
      "Creating calendar failed, please try again",
      500
    );
    return next(error);
  }

  if (!shop) {
    const error = new HttpError("Could not find shop for provided id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdCalendar.save({ session: sess });
    fecthedShop.calendars.push(createdCalendar);
    await fecthedShop.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating calendar failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ calendar: createdCalendar });
};

exports.createCalendar = createCalendar;
