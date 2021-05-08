const express = require("express");
const { check } = require("express-validator");

const appointmentsControllers = require("../controllers/appointments-controllers");

const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/check-admin");

const router = express.Router();

router.get("/user/:uid", appointmentsControllers.getAppointmentsByUserId);
router.get("/shops", appointmentsControllers.getAppointmentsByShops);

router.use(checkAuth);
router.post("/cancel/:aid", appointmentsControllers.cancelAppointment);

module.exports = router;
