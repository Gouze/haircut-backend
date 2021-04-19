const express = require("express");
const { check } = require("express-validator");

const appointmentsControllers = require("../controllers/appointments-controllers");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/user/:uid", appointmentsControllers.getAppointmentsByUserId);

router.use(checkAuth);
module.exports = router;
