const express = require("express");
const { check } = require("express-validator");
const checkAdmin = require("../../middleware/check-admin");

const timeslotsControllers = require("../../controllers/timeslots-controllers");

const router = express.Router();

router.use(checkAdmin);

router.post("/free", timeslotsControllers.adminFreeTimeslot);
router.post("/bookOne", timeslotsControllers.adminBookOneTimeslot);
router.post("/list", timeslotsControllers.adminGetTimeslotsByShopAndDate);
router.post("/book", timeslotsControllers.adminBookTimeslots);
router.get("/shop/:shopId", timeslotsControllers.adminGetAllTimeslotsByShop);
router.delete("/delete", timeslotsControllers.deleteTimeslots);

module.exports = router;
