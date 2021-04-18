const { v4: uuidv4 } = require("uuid");
// const { validationResult } = require("express-validator");
const moment = require("moment");
const mongoose = require("mongoose");
const _ = require("lodash");

const { DateTime, Interval, Duration } = require("luxon");

const HttpError = require("../models/http-error");
const Timeslot = require("../models/timeslot");
const Shop = require("../models/shop");
const Service = require("../models/service");

const getTimeslotsAvailable = async (req, res, next) => {
  let slots;
  const today = new Date();

  try {
    // slots = await Timeslot.find({
    //   date: {
    //     $gte: today,
    //     $lte: today.setFullYear(today.getFullYear() + 1),
    //   },
    // });

    slots = await Timeslot.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching timeslots failed, please try again later",
      500
    );
    return next(error);
  }

  res.json({
    timeslots: slots.map((slot) => slot.toObject({ getters: true })),
  });
};

const createTimeslots = async (req, res, next) => {
  const { schedule, startDate, endDate, excludedDays, shopId } = req.body;
  let shop;
  try {
    shop = await Shop.findById(shopId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a shop",
      500
    );
    return next(error);
  }

  if (!shop) {
    const error = new HttpError(
      "Could not find a note for the provided id.",
      404
    );
    return next(error);
  }
  const createdTimeSlots = [];
  let firstDay = DateTime.fromISO(startDate);
  let lastDay = DateTime.fromISO(endDate);
  let closedDays = excludedDays.map((day) => {
    return DateTime.fromISO(day);
  });

  let allSlots = [];

  Interval.fromDateTimes(firstDay.startOf("day"), lastDay.endOf("day"))
    .splitBy({ days: 1 })
    .map((d) => {
      const found = closedDays.find((day) => d.contains(day));
      if (!found) {
        const numericDay = d.start.toFormat("c");
        const daySchedule = schedule.find((dSch) => {
          return dSch.day == numericDay;
        });
        if (daySchedule) {
          daySchedule.hours.forEach((openingHours) => {
            const startDt = DateTime.fromObject({
              day: parseInt(d.start.toFormat("d")),
              month: parseInt(d.start.toFormat("L")),
              year: parseInt(d.start.toFormat("y")),
              hour: parseInt(openingHours[0].split(":")[0]) + 2,
              minute: parseInt(openingHours[0].split(":")[1]),
            });
            const endDt = DateTime.fromObject({
              day: parseInt(d.start.toFormat("d")),
              month: parseInt(d.start.toFormat("L")),
              year: parseInt(d.start.toFormat("y")),
              hour: parseInt(openingHours[1].split(":")[0]) + 2,
              minute: parseInt(openingHours[1].split(":")[1]),
            });

            const schInterval = Interval.fromDateTimes(startDt, endDt).splitBy(
              Duration.fromObject({ minutes: 15 })
            );

            let dateToSave = new Date(
              d.start.toFormat("y") +
                "-" +
                d.start.toFormat("L") +
                "-" +
                d.start.toFormat("d")
            );

            dateToSave.setHours(dateToSave.getHours() + 2);

            schInterval.forEach((interval) => {
              allSlots.push({
                date: dateToSave,
                startAt: interval.start.toISO(),
                endAt: interval.end.toISO(),
                booked: false,
                shop: shopId,
              });
            });
          });
        }
      }
    });
  console.log(allSlots);

  Timeslot.insertMany(allSlots)
    .then((docs) => {
      docs.forEach((doc) => {
        shop.timeslots.push(doc);
      });
      shop.save();
      res.status(200).json({ timeslots: docs[0] });
    })
    .catch((err) => {
      console.log(err);
    });
};

const getTimeslotsByMonth = async (req, res, next) => {
  let slots;
  let queryDate = new Date("2021-03-03");

  console.log(queryDate);
  try {
    slots = await Timeslot.find({ date: new Date("2021-03-08") });
  } catch (err) {
    const error = new HttpError(
      "Fetching timeslots failed, please try again later",
      500
    );
    return next(error);
  }

  res.json({
    timeslots: slots.map((slot) => slot.toObject({ getters: true })),
  });
};

const bookTimeslots = async (req, res, next) => {
  const slots = req.body.slots;
  let timeslots;

  try {
    timeslots = await Timeslot.find({ _id: { $in: slots } });
  } catch (err) {
    const error = new HttpError(
      "Somehting went wrong, could not find slots",
      500
    );
    return next(error);
  }
  if (!timeslots) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }

  timeslots.map(async (timeslot) => {
    timeslot.booked = true;
    try {
      await timeslot.save();
    } catch (err) {
      const error = new HttpError(
        "Something went wrong, could not book slots",
        500
      );
      return next(error);
    }
  });

  res.status(200).json({ slots: timeslots });
};

const test = async (req, res, next) => {
  let slot;
  const serviceId = req.params.serviceId;
  const date = req.params.date;

  console.log(serviceId);

  try {
    service = await Service.findById(serviceId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a service",
      500
    );
    return next(error);
  }

  try {
    slots = await Timeslot.find({
      date: new Date(date),
    }).sort({ startAt: "asc" });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a slot",
      500
    );
    return next(error);
  }
  // console.log(slots);

  const slotsQty = service.duration / 15;

  // // just to format output
  // const display = (o) => console.log(JSON.stringify(o, null, 4));

  let groupedSlots;
  if (service.slotsPattern.length > 0) {
    // utility function
    const aperture = (n) => (xs) =>
      [...xs.keys()].slice(0, 1 - n).map((i) => xs.slice(i, i + n));

    // main function
    const groupSlots = (n, slots) =>
      aperture(n)(slots).filter((group) => {
        let check = [];
        for (let i = 0; i < service.slotsPattern.length; i++) {
          const element = service.slotsPattern[i];
          if (element) {
            if (!group[i].booked) {
              check.push(true);
            } else {
              check.push(false);
            }
          }
        }
        let checker = (arr) => arr.every((v) => v === true);

        return checker(check);
      });

    groupedSlots = groupSlots(slotsQty, slots);

    res.json({ timeslots: groupedSlots });
  } else {
    const aperture = (n) => (xs) =>
      [...xs.keys()].slice(0, 1 - n).map((i) => xs.slice(i, i + n));

    const last = (xs) => xs[xs.length - 1];

    const groupWith = (fn) => (xs) =>
      xs.reduce(
        (r, x, i, a) =>
          i == 0
            ? [[x]]
            : fn(last(last(r)), x)
            ? [...r.slice(0, -1), [...last(r), x]]
            : [...r, [x]],
        []
      );

    const groupSlots = (n, slots) =>
      groupWith(
        ({ endAt }, { startAt }) =>
          new Date(endAt).valueOf() == new Date(startAt).valueOf()
      )(slots.filter(({ booked }) => !booked)).flatMap((group) =>
        aperture(n)(group)
      );

    groupedSlots = groupSlots(slotsQty, slots);
    res.json({ timeslots: groupedSlots });
  }
};

const getAllTimeslotsByShop = async (req, res, next) => {
  let slots;
  try {
    slots = await Timeslot.find({
      shop: "60762ba477ffd164645f8b45",
      startAt: {
        $gte: new Date(),
        $lte: new Date().getTime() + 1000 * 60 * 60 * 24 * 365,
      },
    }).sort({
      startAt: "asc",
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a slot",
      500
    );
    return next(error);
  }

  if (!slots) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }
  res.json({ timeslots: slots });
};

exports.getAllTimeslotsByShop = getAllTimeslotsByShop;
exports.test = test;
exports.bookTimeslots = bookTimeslots;
exports.getTimeslotsByMonth = getTimeslotsByMonth;
exports.getTimeslotsAvailable = getTimeslotsAvailable;
exports.createTimeslots = createTimeslots;
