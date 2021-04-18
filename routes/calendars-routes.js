const express = require("express");
const { check } = require("express-validator");

const calendarsControllers = require("../controllers/calendars-controllers");

const checkAuth = require("../middleware/check-auth");
const checkSuperAdmin = require("../middleware/check-superAdmin");

const router = express.Router();
router.post("/create", calendarsControllers.createCalendar);

router.use(checkAuth);
router.use(checkSuperAdmin);

module.exports = router;
