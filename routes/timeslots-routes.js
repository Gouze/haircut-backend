const express = require("express");
const { check } = require("express-validator");

const timeslotsControllers = require("../controllers/timeslots-controllers");

const router = express.Router();

router.get("/", timeslotsControllers.getTimeslotsAvailable);
router.get("/group/:date/:serviceId", timeslotsControllers.test);

router.post("/", timeslotsControllers.createTimeslots);
router.get("/timeslots", timeslotsControllers.getTimeslotsByMonth);
router.get("/available", timeslotsControllers.getAllTimeslotsByShop);
router.post("/book", timeslotsControllers.bookTimeslots);

module.exports = router;
